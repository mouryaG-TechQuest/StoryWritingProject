# Quick Start Guide - 5 Minutes to Running App

## Prerequisites Check
✓ Java 21 installed
✓ Maven installed  
✓ Node.js installed
✓ MySQL running with root access

## Step 1: Create Databases (1 minute)
```sql
CREATE DATABASE userdb;
CREATE DATABASE storydb;
```

## Step 2: Build Backend (2 minutes)
```cmd
cd microservices
mvn clean install -DskipTests
```

## Step 3: Install Frontend (1 minute)
```cmd
cd ..\Frontend
npm install
```

## Step 4: Start Everything (30 seconds)
```cmd
cd ..
run-all.bat
```

Wait 2 minutes for services to start.

## Step 5: Open App
http://localhost:5173

## Verify Services Running
- Eureka: http://localhost:8761 (should show 3 services)
- API Gateway: http://localhost:8080/actuator/health
- Frontend: http://localhost:5173

## First Use
1. Click "Register"
2. Enter username & password
3. Start creating stories!

## Troubleshooting

### Services won't start
- Check MySQL is running (services.msc → MySQL80)
- Update password in application.properties if not "root"

### Port conflicts
```cmd
netstat -ano | findstr "8080"
taskkill /PID <process_id> /F
```

### Build fails
```cmd
mvn clean install -U -DskipTests
```

## Stop Everything
Close all terminal windows or:
```cmd
taskkill /F /IM java.exe
taskkill /F /IM node.exe
```

## Need Help?
See SETUP_GUIDE.md for detailed instructions.
