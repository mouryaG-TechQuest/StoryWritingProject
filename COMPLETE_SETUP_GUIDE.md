# 🚀 Story Writing Project - Complete Setup & Run Guide

## ✅ All Code Errors Fixed

All TypeScript and Java compilation errors have been resolved:
- ✅ Frontend: All TypeScript errors fixed, proper types defined
- ✅ Backend: All Java null safety issues and unused imports resolved
- ✅ Build verified: Both frontend and backend compile successfully

---

## 📋 Prerequisites

### Required Software
1. **Java Development Kit (JDK) 21**
   - Download: https://www.oracle.com/java/technologies/downloads/#java21
   - Verify: `java -version`

2. **Maven 3.8+**
   - Download: https://maven.apache.org/download.cgi
   - Verify: `mvn -version`

3. **MySQL 8.0+**
   - Download: https://dev.mysql.com/downloads/mysql/
   - Start MySQL service
   - Verify: `mysql --version`

4. **Node.js 18+ and npm**
   - Download: https://nodejs.org/
   - Verify: `node -v` and `npm -v`

---

## 🗄️ Database Setup

### 1. Start MySQL Server
```bash
# Windows
net start MySQL80

# macOS/Linux
sudo systemctl start mysql
```

### 2. Create Databases
```sql
mysql -u root -p

CREATE DATABASE userdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE storydb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Verify
SHOW DATABASES;
```

### 3. Verify MySQL Credentials
Update `application.properties` in each service if your MySQL credentials differ:
- User: `root`
- Password: `root`
- Host: `localhost:3306`

---

## 🏗️ Backend Setup & Run

### Option 1: Quick Start (Recommended)
```bash
# Run from project root
cd C:\Users\hp\Desktop\StoryWritingProject
.\quick-start.bat
```

This will start all services in sequence:
1. Eureka Server (Port 8761)
2. User Service (Port 8081)
3. Story Service (Port 8082)
4. API Gateway (Port 8080)

### Option 2: Manual Start (Step by Step)

#### Step 1: Start Eureka Server
```bash
cd microservices\eureka-server
mvn spring-boot:run
```
**Wait for:** "Started EurekaApplication" message
**Verify:** http://localhost:8761

#### Step 2: Start User Service
```bash
# New terminal
cd microservices\user-service
mvn spring-boot:run
```
**Wait for:** "Started UserServiceApplication" message
**Verify:** http://localhost:8761 (should show user-service registered)

#### Step 3: Start Story Service
```bash
# New terminal
cd microservices\story-service
mvn spring-boot:run
```
**Wait for:** "Started StoryServiceApplication" message
**Verify:** http://localhost:8761 (should show story-service registered)

#### Step 4: Start API Gateway
```bash
# New terminal
cd microservices\api-gateway
mvn spring-boot:run
```
**Wait for:** "Started ApiGatewayApplication" message
**Verify:** http://localhost:8080

### Option 3: Build JAR Files (Production)
```bash
# Build all services
cd microservices
mvn clean install -DskipTests

# Run each service
java -jar eureka-server/target/eureka-server-0.0.1-SNAPSHOT.jar
java -jar user-service/target/user-service-0.0.1-SNAPSHOT.jar
java -jar story-service/target/story-service-0.0.1-SNAPSHOT.jar
java -jar api-gateway/target/api-gateway-0.0.1-SNAPSHOT.jar
```

---

## 💻 Frontend Setup & Run

### 1. Install Dependencies
```bash
cd Frontend
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

**Access:** http://localhost:5173

### 3. Build for Production
```bash
npm run build
```

---

## 🔍 Verify Everything is Running

### 1. Check Eureka Dashboard
Visit: http://localhost:8761
- Should show: user-service, story-service registered

### 2. Check Service Health
```bash
# User Service
curl http://localhost:8081/actuator/health

# Story Service
curl http://localhost:8082/actuator/health

# Gateway
curl http://localhost:8080/actuator/health
```

### 3. Test API Gateway
```bash
# Test user service through gateway
curl http://localhost:8080/api/auth/health

# Test story service through gateway
curl http://localhost:8080/api/stories/genres
```

### 4. Test Frontend
1. Open http://localhost:5173
2. Register a new user
3. Login
4. Create a story

---

## 🛑 Stopping Services

### Quick Stop
```bash
cd C:\Users\hp\Desktop\StoryWritingProject
.\stop-all.bat
```

### Manual Stop
Press `Ctrl+C` in each terminal running a service

---

## 📁 Project Structure

```
StoryWritingProject/
├── Frontend/                           # React + TypeScript
│   ├── src/
│   │   ├── api/                       # API service layer
│   │   ├── components/
│   │   │   ├── common/                # Shared components
│   │   │   ├── features/
│   │   │   │   ├── story/            # Story-related components
│   │   │   │   └── timeline/         # Timeline components
│   │   │   └── layout/               # Layout components
│   │   ├── pages/                     # Page components
│   │   ├── types/                     # TypeScript definitions
│   │   ├── utils/                     # Utility functions
│   │   │   ├── httpClient.ts         # HTTP client
│   │   │   ├── errorHandler.ts       # Error handling
│   │   │   └── validation.ts         # Form validation
│   │   └── App.tsx                    # Main app component
│   └── package.json
│
├── microservices/
│   ├── eureka-server/                 # Service Discovery
│   ├── api-gateway/                   # API Gateway
│   ├── user-service/                  # User Management
│   └── story-service/                 # Story Management
│
├── ARCHITECTURE.md                     # Architecture documentation
├── quick-start.bat                    # Quick start script
└── stop-all.bat                       # Stop all services
```

---

## 🔧 Configuration

### Backend Configuration Files
- `microservices/user-service/src/main/resources/application.properties`
- `microservices/story-service/src/main/resources/application.properties`
- `microservices/api-gateway/src/main/resources/application.properties`
- `microservices/eureka-server/src/main/resources/application.properties`

### Frontend Configuration
- `Frontend/vite.config.ts` - Vite configuration
- `Frontend/tsconfig.json` - TypeScript configuration

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Windows - Find and kill process
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### Database Connection Failed
1. Verify MySQL is running
2. Check credentials in `application.properties`
3. Verify databases exist: `SHOW DATABASES;`

### Eureka Connection Failed
1. Ensure Eureka Server is running
2. Wait 30 seconds for services to register
3. Check http://localhost:8761

### Frontend Build Errors
```bash
cd Frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Backend Build Errors
```bash
cd microservices
mvn clean install -U
```

---

## 📊 Service Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend | 5173 | http://localhost:5173 |
| API Gateway | 8080 | http://localhost:8080 |
| User Service | 8081 | http://localhost:8081 |
| Story Service | 8082 | http://localhost:8082 |
| Eureka Server | 8761 | http://localhost:8761 |

---

## 🎯 Testing the Application

### 1. User Registration
```http
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "password": "Test@1234",
  "confirmPassword": "Test@1234",
  "firstName": "Test",
  "lastName": "User",
  "email": "test@example.com"
}
```

### 2. User Login
```http
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "Test@1234"
}
```

### 3. Create Story
```http
POST http://localhost:8080/api/stories
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "title": "My First Story",
  "description": "A great story",
  "genreIds": [1, 2],
  "isPublished": true
}
```

---

## 🔐 Default Credentials

### Database
- Username: `root`
- Password: `root`

### JWT Secret
- Located in `application.properties`
- Default: `MySecretKeyForJWTSigningReplaceWithStrongerOne`
- **⚠️ Change this in production!**

---

## 📝 Development Notes

### Frontend Hot Reload
- Changes to `.tsx/.ts` files auto-reload
- No server restart needed

### Backend Hot Reload
- Use Spring Boot DevTools (included)
- Or restart service after changes

### Database Schema
- Auto-created on first run
- `spring.jpa.hibernate.ddl-auto=update`

---

## 🚀 Production Deployment

### 1. Build Frontend
```bash
cd Frontend
npm run build
# Output: dist/ folder
```

### 2. Build Backend JARs
```bash
cd microservices
mvn clean package -DskipTests
```

### 3. Environment Variables
Create `.env` files for production:
- Database URLs
- JWT secrets
- Email credentials
- OAuth credentials

### 4. Reverse Proxy (Nginx)
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location /api {
        proxy_pass http://localhost:8080;
    }

    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 📚 Documentation

- **Architecture**: See `ARCHITECTURE.md`
- **API Docs**: Coming soon (Swagger/OpenAPI)
- **Frontend Types**: See `Frontend/src/types/index.ts`

---

## 🆘 Support

If you encounter issues:
1. Check logs in each service terminal
2. Verify all services are running
3. Check Eureka dashboard for service registration
4. Review `ARCHITECTURE.md` for system overview

---

## ✨ New Features Added

### Frontend
- ✅ Comprehensive TypeScript types
- ✅ HTTP client with error handling
- ✅ Form validation utilities
- ✅ Error handling utilities
- ✅ Feature-based architecture

### Backend
- ✅ All compilation errors fixed
- ✅ Null safety improvements
- ✅ Proper exception handling
- ✅ Clean code structure

---

**Happy Coding! 🎉**
