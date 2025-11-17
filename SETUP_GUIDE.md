# Setup Guide

## Initial Setup (First Time Only)

### 1. Install Prerequisites

#### Java JDK 21
1. Download from [Oracle](https://www.oracle.com/java/technologies/downloads/) or [Adoptium](https://adoptium.net/)
2. Install and verify:
```cmd
java -version
```
Should show: `java version "21.x.x"`

#### Maven
1. Download from [Apache Maven](https://maven.apache.org/download.cgi)
2. Extract and add to PATH
3. Verify:
```cmd
mvn -version
```

#### Node.js & npm
1. Download from [nodejs.org](https://nodejs.org/) (LTS version recommended)
2. Install and verify:
```cmd
node -v
npm -v
```

#### MySQL
1. Download from [mysql.com](https://dev.mysql.com/downloads/installer/)
2. Install MySQL Server 8.0+
3. Remember root password during installation

### 2. Database Setup

1. Open MySQL Command Line Client or MySQL Workbench
2. Login with root credentials
3. Create databases:
```sql
CREATE DATABASE userdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE storydb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

4. Verify databases exist:
```sql
SHOW DATABASES;
```

### 3. Configure Database Credentials

If your MySQL root password is NOT "root", update these files:

**File: `microservices/user-service/src/main/resources/application.properties`**
```properties
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

**File: `microservices/story-service/src/main/resources/application.properties`**
```properties
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

### 4. Build Backend Services

```cmd
cd microservices
mvn clean install -DskipTests
```

This will:
- Download all dependencies
- Compile all services
- Create JAR files
- Take 3-5 minutes on first run

### 5. Install Frontend Dependencies

```cmd
cd Frontend
npm install
```

This will:
- Download all npm packages
- Take 1-2 minutes on first run

## Running the Application

### Method 1: All-in-One Script (Easiest)

From the project root:
```cmd
run-all.bat
```

This opens 5 terminal windows:
1. Eureka Server (8761)
2. User Service (8081)
3. Story Service (8082)
4. API Gateway (8080)
5. Frontend (5173)

**Wait 2-3 minutes** for all services to start and register with Eureka.

### Method 2: Manual Start (For Debugging)

Start in this order with wait times:

1. **Eureka Server** (wait 30 seconds)
```cmd
start-eureka.bat
```

2. **User Service** (wait 20 seconds)
```cmd
start-user.bat
```

3. **Story Service** (wait 20 seconds)
```cmd
start-story.bat
```

4. **API Gateway** (wait 15 seconds)
```cmd
start-gateway.bat
```

5. **Frontend**
```cmd
start-frontend.bat
```

### Verification

1. **Check Eureka Dashboard**: http://localhost:8761
   - Should show 3 instances registered:
     - API-GATEWAY
     - USER-SERVICE
     - STORY-SERVICE

2. **Check API Gateway**: http://localhost:8080/actuator/health
   - Should return: `{"status":"UP"}`

3. **Open Frontend**: http://localhost:5173
   - Should show login/register page

## First Time Use

1. Open http://localhost:5173
2. Click "Need an account? Register"
3. Enter username and password
4. You'll be automatically logged in
5. Start creating stories!

## Common Issues & Fixes

### Issue: "Port already in use"

**Solution**:
```cmd
# Windows: Find and kill process using port (example for port 8080)
netstat -ano | findstr :8080
taskkill /PID <process_id> /F
```

### Issue: Services not appearing in Eureka

**Solution**:
- Wait 30-60 seconds after starting Eureka
- Restart the service that didn't register
- Check application.properties for correct eureka URL

### Issue: Database connection failed

**Solution**:
1. Verify MySQL is running:
```cmd
# Windows Services
services.msc
# Find MySQL80 and ensure it's Running
```

2. Test connection:
```cmd
mysql -u root -p
# Enter password when prompted
```

3. Verify databases exist:
```sql
SHOW DATABASES;
```

### Issue: Frontend shows blank page

**Solution**:
1. Open browser console (F12)
2. Check for errors
3. Verify API Gateway is running: http://localhost:8080
4. Clear browser cache and reload

### Issue: CORS errors in browser console

**Solution**:
- Ensure API Gateway is running
- Clear browser cache
- Try incognito/private mode
- Restart Frontend dev server

### Issue: Maven build fails

**Solution**:
```cmd
# Clean Maven cache and rebuild
cd microservices
mvn clean
mvn install -DskipTests -U
```

### Issue: npm install fails

**Solution**:
```cmd
cd Frontend
# Delete node_modules and package-lock.json
rmdir /s /q node_modules
del package-lock.json
# Reinstall
npm install
```

## Stopping the Application

### Stop All Services:
- Close all terminal windows opened by the batch scripts
- Or press Ctrl+C in each terminal window

### Alternative (Clean Shutdown):
```cmd
# Kill all Java processes
taskkill /F /IM java.exe

# Kill all Node processes
taskkill /F /IM node.exe
```

## Development Mode

### Backend Hot Reload
Spring Boot DevTools is included. Code changes will auto-reload.

### Frontend Hot Reload
Vite provides instant HMR. Save files and see changes immediately.

## Production Build

### Backend
```cmd
cd microservices
mvn clean package -DskipTests
```
JARs will be in `target/` directories.

### Frontend
```cmd
cd Frontend
npm run build
```
Build output in `dist/` directory.

## Environment Variables

### Backend
Set in `application.properties` files:
- Database credentials
- JWT secret (change for production!)
- Server ports
- Eureka URLs

### Frontend
Create `.env` file from `.env.example`:
```properties
VITE_API_BASE_URL=/api
```

## Logs

### Backend Logs
- Displayed in terminal windows
- Spring Boot default logging
- Check for errors/exceptions

### Frontend Logs
- Browser Console (F12)
- Vite dev server terminal
- Network tab for API calls

## Database Management

### View Data
Use MySQL Workbench or command line:
```sql
USE userdb;
SELECT * FROM users;

USE storydb;
SELECT * FROM stories;
SELECT * FROM characters;
SELECT * FROM likes;
SELECT * FROM favorites;
SELECT * FROM comments;
```

### Reset Database
```sql
DROP DATABASE userdb;
DROP DATABASE storydb;
CREATE DATABASE userdb;
CREATE DATABASE storydb;
```
Then restart services (JPA will recreate tables).

## Upgrading Dependencies

### Backend
Update versions in `microservices/pom.xml`:
```xml
<spring-boot.version>3.2.0</spring-boot.version>
<spring-cloud.version>2023.0.0</spring-cloud.version>
```

Then rebuild:
```cmd
cd microservices
mvn clean install
```

### Frontend
```cmd
cd Frontend
npm update
```

## Additional Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Cloud Documentation](https://spring.io/projects/spring-cloud)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

## Getting Help

1. Check logs in terminal windows
2. Verify Eureka dashboard shows all services
3. Test API endpoints with Postman/Thunder Client
4. Review this guide's troubleshooting section
5. Check browser console for frontend errors
