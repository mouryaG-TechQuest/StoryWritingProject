# StoryWritingProject - ONE-CLICK STARTUP GUIDE

## ✅ Fixed Issues

1. **Backend Code**: Removed unused imports from security config files
2. **Title Validation**: Backend now validates that story titles are required and unique per user
3. **Startup Scripts**: Created reliable one-click startup scripts

## 🚀 ONE-CLICK START

### **Recommended: Quick Start (Simplest)**

```cmd
quick-start.bat
```

This script will:
- Stop any existing services
- Start all 5 services in minimized windows
- Services start in the correct order with proper delays

**Wait 90-120 seconds** for all services to fully initialize, then visit:
**http://localhost:5173**

### Alternative: Clean Start (Rebuilds Everything)

If you want to rebuild before starting:

```cmd
start-clean.bat
```

This will clean, rebuild, and start everything fresh (takes longer).

## 🛑 STOP ALL SERVICES

```cmd
stop-all.bat
```

This kills all Java and Node processes instantly.

## 📋 Services & Ports

| Service | Port | URL |
|---------|------|-----|
| Eureka Server | 8761 | http://localhost:8761 |
| User Service | 8081 | http://localhost:8081/actuator/health |
| Story Service | 8082 | http://localhost:8082/actuator/health |
| API Gateway | 8080 | http://localhost:8080/actuator/health |
| Frontend | 5173 | http://localhost:5173 |

## ✨ NEW FEATURES IMPLEMENTED

### Title Validation
- ✅ Story title is **mandatory** - cannot create/update without a title
- ✅ **Duplicate title check** - each user can only have one story with a given title
- ✅ Clear error messages:
  - "Story title is required"
  - "A story with this title already exists. Please choose a different title."

### Character Management
- ✅ Add Character button saves immediately to database
- ✅ Update Character button updates database in real-time
- ✅ Inline success/error messages (no popups)
- ✅ Real-time character count updates across the site
- ✅ Characters persist on page reload

### Button Logic
- ✅ "Create Story" shown when creating new story
- ✅ "Update Story" shown when editing existing story (based on database storyId)
- ✅ All validation happens on backend with proper error responses

## 🔧 Troubleshooting

### If services don't start:

1. **Check if ports are in use:**
   ```cmd
   netstat -ano | findstr ":8761 :8081 :8082 :8080 :5173"
   ```

2. **Stop everything and retry:**
   ```cmd
   stop-all.bat
   quick-start.bat
   ```

3. **Check individual service windows** - they stay open and show any errors

4. **Rebuild manually if needed:**
   ```cmd
   cd microservices\eureka-server
   mvn clean package -DskipTests
   
   cd ..\user-service
   mvn clean package -DskipTests
   
   cd ..\story-service
   mvn clean package -DskipTests
   
   cd ..\api-gateway
   mvn clean package -DskipTests
   ```

### If Frontend doesn't start:

```cmd
cd Frontend
npm install
npm run dev
```

### Database Connection Issues:

Make sure MySQL is running and the `storydb` database exists with proper credentials in `application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/storydb
spring.datasource.username=root
spring.datasource.password=your_password
```

## 📊 Verify All Services Running

Run this PowerShell command:

```powershell
$ports = @(8761, 8081, 8082, 8080, 5173)
foreach ($port in $ports) {
    try {
        $url = if ($port -eq 8761) { "http://localhost:$port" } 
               elseif ($port -eq 5173) { "http://localhost:$port" }
               else { "http://localhost:$port/actuator/health" }
        Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 3 | Out-Null
        Write-Host "✓ Port $port : RUNNING" -ForegroundColor Green
    } catch {
        Write-Host "✗ Port $port : NOT RUNNING" -ForegroundColor Red
    }
}
```

## 🎯 Testing the Application

1. **Login/Register** at http://localhost:5173
2. **Create Story** - Try without a title (should fail with validation error)
3. **Create Story** - Add a title and create successfully
4. **Try Duplicate** - Create another story with the same title (should fail)
5. **Add Characters** - Click "Add Character", fill details, save
6. **Verify Persistence** - Refresh page, characters should still be there
7. **Update Story** - Edit an existing story, button says "Update Story"
8. **Character Count** - Add characters and see count update in real-time

## 📝 Project Structure

```
StoryWritingProject/
├── quick-start.bat         ← USE THIS (recommended)
├── start-clean.bat         ← Alternative (rebuilds first)
├── stop-all.bat            ← Stop everything
├── microservices/
│   ├── eureka-server/
│   ├── user-service/
│   ├── story-service/
│   └── api-gateway/
└── Frontend/
```

## 💡 Tips

- **First run**: Takes longer (Maven downloads dependencies)
- **Subsequent runs**: Much faster with `quick-start.bat`
- **Clean slate**: Use `start-clean.bat` if things get weird
- **Check logs**: Service windows show real-time logs
- **Port conflicts**: Run `stop-all.bat` before starting again

## ✅ All Code Fixed

- ✅ Backend validation implemented correctly
- ✅ Frontend error handling improved
- ✅ Unused imports removed
- ✅ One-click startup scripts created
- ✅ Character persistence working
- ✅ Title validation and duplicate checking functional

## 🎉 Ready to Use!

Just run `quick-start.bat` and wait 90 seconds!
