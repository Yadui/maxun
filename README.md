Certainly! Here's the reformatted section for better readability:

---

### Local Setup
#### Docker Compose
```bash
# Clone the repository
git clone https://github.com/getmaxun/maxun

# Build and start the service with Docker Compose
docker-compose up -d --build
```

#### Without Docker
1. Make sure you have Node.js, PostgreSQL, MinIO, and Redis installed.
2. Clone the repository:

```bash
# Clone the repository
git clone https://github.com/getmaxun/maxun
```
or, if you'd like to clone into the current directory:

```bash
git clone https://github.com/getmaxun/maxun .
```

3. Change to the project directory:

```bash
cd maxun
```

4. Install dependencies:

```bash
npm install
```

5. Change to `maxun-core` directory and install its dependencies:

```bash
cd maxun-core
npm install
```

6. Start both the frontend and backend:

```bash
npm run start
```

Now you can access:
- Frontend: [http://localhost:5173/](http://localhost:5173/)
- Backend: [http://localhost:8080/](http://localhost:8080/)
