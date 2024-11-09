import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../storage/db";
import { WorkflowFile, Where, What, WhereWhatPair } from "maxun-core";

interface RobotMeta {
  name: string;
  id: string;
  createdAt: string;
  pairs: number;
  updatedAt: string;
  params: any[];
}

interface RobotWorkflow {
  workflow: WhereWhatPair[];
}

interface IntegrationData {
  google_sheets?: {
    email: string | null;
    sheet_id: string | null;
    sheet_name: string | null;
    access_token: string | null;
    refresh_token: string | null;
  };
  airtable?: {
    base_id: string | null;
    table_name: string | null;
    access_token: string | null;
    refresh_token: string | null;
  };
}

interface RobotAttributes {
  id: string;
  userId?: number;
  recording_meta: RobotMeta;
  recording: RobotWorkflow;
  schedule?: ScheduleConfig | null;
  integrations?: IntegrationData | null;
}

interface ScheduleConfig {
  runEvery: number;
  runEveryUnit: "MINUTES" | "HOURS" | "DAYS" | "WEEKS" | "MONTHS";
  startFrom:
    | "SUNDAY"
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | "SATURDAY";
  atTimeStart?: string;
  atTimeEnd?: string;
  timezone: string;
  lastRunAt?: Date;
  nextRunAt?: Date;
  dayOfMonth?: string;
  cronExpression?: string;
}

interface RobotCreationAttributes extends Optional<RobotAttributes, "id"> {}

class Robot
  extends Model<RobotAttributes, RobotCreationAttributes>
  implements RobotAttributes
{
  public id!: string;
  public userId!: number;
  public recording_meta!: RobotMeta;
  public recording!: RobotWorkflow;
  public schedule!: ScheduleConfig | null;
  public integrations!: IntegrationData | null;
}

Robot.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    recording_meta: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    recording: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    integrations: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
    schedule: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "robot",
    timestamps: false,
  }
);

// Robot.hasMany(Run, {
//   foreignKey: 'robotId',
//   as: 'runs', // Alias for the relation
// });

export default Robot;
