import { google } from "googleapis";
import logger from "../../logger";
import Run from "../../models/Run";
import Robot from "../../models/Robot";

interface GoogleSheetUpdateTask {
  robotId: string;
  runId: string;
  status: "pending" | "completed" | "failed";
  retries: number;
}

const MAX_RETRIES = 5;

export let googleSheetUpdateTasks: { [runId: string]: GoogleSheetUpdateTask } =
  {};

export async function updateGoogleSheet(robotId: string, runId: string) {
  try {
    const run = await Run.findOne({ where: { runId } });

    if (!run) {
      throw new Error(`Run not found for runId: ${runId}`);
    }

    const plainRun = run.toJSON();

    if (plainRun.status === "success") {
      let data: { [key: string]: any }[] = [];
      if (
        plainRun.serializableOutput &&
        Object.keys(plainRun.serializableOutput).length > 0
      ) {
        data = plainRun.serializableOutput["item-0"] as {
          [key: string]: any;
        }[];
      } else if (plainRun.binaryOutput && plainRun.binaryOutput["item-0"]) {
        // Handle binaryOutput by setting the URL as a data entry
        const binaryUrl = plainRun.binaryOutput["item-0"] as string;

        // Create a placeholder object with the binary URL
        data = [{ "Screenshot URL": binaryUrl }];
      }

      const robot = await Robot.findOne({
        where: { "recording_meta.id": robotId },
      });

      if (!robot) {
        throw new Error(`Robot not found for robotId: ${robotId}`);
      }

      const plainRobot = robot.toJSON();

      const email = plainRobot.integrations?.google_sheets?.email;
      const spreadsheetId = plainRobot.integrations?.google_sheets?.sheet_id;

      if (email && spreadsheetId) {
        console.log(
          `Preparing to write data to Google Sheet for robot: ${robotId}, spreadsheetId: ${spreadsheetId}`
        );

        const headers = Object.keys(data[0]);
        const rows = data.map((row: { [key: string]: any }) =>
          Object.values(row)
        );
        const outputData = [headers, ...rows];

        await writeDataToSheet(robotId, spreadsheetId, outputData);
        console.log(
          `Data written to Google Sheet successfully for Robot: ${robotId} and Run: ${runId}`
        );
      } else {
        console.log("Google Sheets integration not configured.");
      }
    } else {
      console.log(
        "Run status is not success or serializableOutput is missing."
      );
    }
  } catch (error: any) {
    console.error(
      `Failed to write data to Google Sheet for Robot: ${robotId} and Run: ${runId}: ${error.message}`
    );
  }
}

export async function writeDataToSheet(
  robotId: string,
  spreadsheetId: string,
  data: any[]
) {
  try {
    const robot = await Robot.findOne({
      where: { "recording_meta.id": robotId },
    });

    if (!robot) {
      throw new Error(`Robot not found for robotId: ${robotId}`);
    }

    const plainRobot = robot.toJSON();

    const access_token = plainRobot.integrations?.google_sheets?.access_token;
    const refresh_token = plainRobot.integrations?.google_sheets?.refresh_token;

    if (!access_token || !refresh_token) {
      throw new Error("Google Sheets access not configured for user");
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: access_token,
      refresh_token: refresh_token,
    });

    oauth2Client.on("tokens", async (tokens) => {
      // Create a copy of the current integrations or initialize as an empty object
      const updatedIntegrations = robot.integrations
        ? { ...robot.integrations }
        : {};

      // Ensure google_sheets is initialized as an object if it doesn't exist
      updatedIntegrations.google_sheets = updatedIntegrations.google_sheets || {
        email: null,
        sheet_id: null,
        sheet_name: null,
        access_token: null,
        refresh_token: null,
      };

      // Update tokens if they exist
      if (tokens.refresh_token) {
        updatedIntegrations.google_sheets.refresh_token = tokens.refresh_token;
      }
      if (tokens.access_token) {
        updatedIntegrations.google_sheets.access_token = tokens.access_token;
      }

      // Update the Robot model with the modified integrations object
      await robot.update({ integrations: updatedIntegrations });
    });

    const sheets = google.sheets({ version: "v4", auth: oauth2Client });

    const resource = { values: data };
    console.log("Attempting to write to spreadsheet:", spreadsheetId);

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Sheet1!A1",
      valueInputOption: "USER_ENTERED",
      requestBody: resource,
    });

    if (response.status === 200) {
      console.log("Data successfully appended to Google Sheet.");
    } else {
      console.error("Google Sheets append failed:", response);
    }

    logger.log(`info`, `Data written to Google Sheet: ${spreadsheetId}`);
  } catch (error: any) {
    logger.log(`error`, `Error writing data to Google Sheet: ${error.message}`);
    throw error;
  }
}

export const processGoogleSheetUpdates = async () => {
  while (true) {
    let hasPendingTasks = false;
    for (const runId in googleSheetUpdateTasks) {
      const task = googleSheetUpdateTasks[runId];
      console.log(
        `Processing task for runId: ${runId}, status: ${task.status}`
      );

      if (task.status === "pending") {
        hasPendingTasks = true;
        try {
          await updateGoogleSheet(task.robotId, task.runId);
          console.log(`Successfully updated Google Sheet for runId: ${runId}`);
          delete googleSheetUpdateTasks[runId];
        } catch (error: any) {
          console.error(
            `Failed to update Google Sheets for run ${task.runId}:`,
            error
          );
          if (task.retries < MAX_RETRIES) {
            googleSheetUpdateTasks[runId].retries += 1;
            console.log(
              `Retrying task for runId: ${runId}, attempt: ${task.retries}`
            );
          } else {
            googleSheetUpdateTasks[runId].status = "failed";
            console.log(
              `Max retries reached for runId: ${runId}. Marking task as failed.`
            );
          }
        }
      }
    }

    if (!hasPendingTasks) {
      console.log("No pending tasks. Exiting loop.");
      break;
    }

    console.log("Waiting for 5 seconds before checking again...");
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
};
