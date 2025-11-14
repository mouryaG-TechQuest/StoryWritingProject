# Backend (Spring Boot) for StoryWritingProject

This folder contains a Spring Boot backend scaffold for the StoryWritingProject.

Quick Start (Windows cmd.exe):

1. Ensure you have JDK 17+ and Maven installed and on PATH.
2. Create a MySQL database (example name: storydb) and update `src/main/resources/application.properties` with your DB credentials.
3. From a command prompt, run:

   cd C:\Users\hp\Desktop\StoryWritingProject\Backend
   mvn clean package
   mvn spring-boot:run


Notes:
- The project uses JWT for authentication but the JWT and Security components are minimal; you'll likely want to add registration/login endpoints and configure Jwt filters.
- Update `jwt.secret` in `application.properties` before production use.
- CORS is enabled on the StoryController for http://localhost:3000; adjust as needed (Vite may run on 5173 or 3000).

Swagger / OpenAPI
------------------
With the included springdoc dependency, once the application is running you can browse the API UI at:

   http://localhost:8080/swagger-ui/index.html

Docker
------
To run the app and a MySQL instance via docker-compose:

   docker compose up --build

This will build the app image and start MySQL. The app waits for the DB health check before starting.

Integration tests
-----------------
An integration test has been added under `src/test/java/.../integration`. The tests use an in-memory H2 database.

End-to-end (Frontend + Backend)
-------------------------------
To run the full stack locally (without installing MySQL locally) use Docker Compose for backend and a local dev server for the frontend:

1. Start backend + MySQL via Docker Compose

   cd Backend
   docker compose up --build

   This builds the app image and starts MySQL. The backend will be reachable at http://localhost:8080 when ready.

2. Start the frontend dev server

   Open a separate terminal (cmd.exe) and run:

   cd Frontend
   npm install
   npm run dev

3. Open the frontend in the browser (Vite will show the local URL, commonly http://localhost:5173). The frontend is configured to call the backend at `http://localhost:8080/api` by default via `Frontend/.env`.

If CSS appears missing initially, the app includes a small `public/fallback.css` that provides basic styling while the app bundle and Tailwind CSS are built.


I don't have access to your machine to run Docker. If you tried `docker compose up --build` and saw:

   'docker' is not recognized as an internal or external command,
   operable program or batch file.

it means Docker is not installed or not available in your PATH. Here are two straightforward options:

A) Install Docker Desktop (recommended)
   - Download and install Docker Desktop for Windows: https://www.docker.com/products/docker-desktop
   - You may need to enable WSL2 during installation (Docker installer guides this).
   - After install, open a new cmd.exe and run:

      docker --version
      docker compose version

   - Then in this project `Backend` folder, run:

      docker compose up --build

B) Run backend locally without Docker (H2 in-memory DB for development)
   - I added a dev profile that uses H2 so you don't need MySQL or Docker to try the API.
   - From a Windows Command Prompt:

      cd C:\Users\hp\Desktop\StoryWritingProject\Backend
      run-backend-dev.bat

   - This batch script runs Maven with the `dev` profile which uses `src/main/resources/application-dev.properties` (H2 memory DB, H2 console at `/h2-console`).

If you choose option B (no Docker), the frontend will work the same — it's configured to call `http://localhost:8080/api` by default.

Maven not found / Windows quick helpers
-------------------------------------
If you tried `run-backend-dev.bat` and saw `'mvn' is not recognized...` it means Maven is not installed on your PATH.

Quick options:

- Install Java JDK 17+ and Maven:
   - Install JDK 17 (Temurin): https://adoptium.net/
   - Install Maven: https://maven.apache.org/install.html
   - Or use Chocolatey (Windows package manager) to install Maven:
      - Open an elevated PowerShell and run: `choco install maven -y`

- If you prefer an automated helper, run the PowerShell helper which checks for `mvn` and will attempt Docker if available:

   Open PowerShell and run:

      cd C:\Users\hp\Desktop\StoryWritingProject\Backend
      .\run-backend-dev-check.ps1

   The script will:
      - Run `mvn -Dspring-boot.run.profiles=dev spring-boot:run` if Maven is present
      - Otherwise, it will attempt `docker compose up --build` if Docker is present
      - Otherwise, it will instruct you how to install Maven or Docker

