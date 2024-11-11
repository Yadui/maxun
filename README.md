<h1 align="center">
    <div>
        <a href="https://maxun-website.vercel.app/">
            <img src="/src/assets/maxunlogo.png" width="50" />
            <br>
            Maxun
        </a>
    </div>
    Open-Source No-Code Web Data Extraction Platform <br>
</h1>

<p align="center">
Maxun lets you train a robot in 2 minutes and scrape the web on auto-pilot. Web data extraction doesn't get easier than this!
</p>


<p align="center">
    <a href="https://maxun-website.vercel.app/"><b>Website</b></a> |
    <a href="https://discord.gg/5GbPjBUkws"><b>Discord</b></a> |
    <a href="https://x.com/maxun_io"><b>Twitter</b></a> |
    <a href="https://docs.google.com/forms/d/e/1FAIpQLSdbD2uhqC4sbg4eLZ9qrFbyrfkXZ2XsI6dQ0USRCQNZNn5pzg/viewform"><b>Join Maxun Cloud</b></a> | 
    <a href="https://www.youtube.com/@MaxunOSS"><b>Watch Tutorials</b></a>
</p>

![maxun_demo](https://github.com/user-attachments/assets/a61ba670-e56a-4ae1-9681-0b4bd6ba9cdc)

<img src="https://static.scarf.sh/a.png?x-pxid=c12a77cc-855e-4602-8a0f-614b2d0da56a" />


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
