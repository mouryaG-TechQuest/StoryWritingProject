# Story Writing Project - Microservices Architecture

## 📁 Project Structure

```
StoryWritingProject/
├── Frontend/                    # React + TypeScript UI
├── microservices/              # Spring Boot Microservices
│   ├── eureka-server/         # Service Discovery
│   ├── api-gateway/           # API Gateway (Port 8080)
│   ├── user-service/          # User Management (Port 8081)
│   ├── story-service/         # Story & Content (Port 8082)
│   ├── config-server/         # Configuration Management (Port 8888) [NEW]
│   └── monitoring-service/    # Health & Metrics (Port 8083) [PLANNED]
└── docs/                      # Documentation
```

## 🏗️ Architecture Overview

### Current Services

#### 1. **Eureka Server** (Port 8761)
- **Purpose**: Service Discovery
- **Responsibilities**:
  - Service registration
  - Service health monitoring
  - Load balancing support

#### 2. **API Gateway** (Port 8080)
- **Purpose**: Single Entry Point
- **Responsibilities**:
  - Request routing
  - Load balancing
  - Cross-cutting concerns (CORS, auth)
- **Routes**:
  - `/api/auth/**` → user-service
  - `/api/stories/**` → story-service
  - `/uploads/**` → story-service

#### 3. **User Service** (Port 8081)
- **Purpose**: User & Authentication Management
- **Database**: `userdb` (MySQL)
- **Responsibilities**:
  - User registration/login
  - JWT token management
  - Password reset/email verification
  - OAuth2 integration (Google, Microsoft)
  - Profile management
- **Key Features**:
  - Email verification
  - Password reset with 5-digit codes
  - Security features (account locking, audit logging)

#### 4. **Story Service** (Port 8082)
- **Purpose**: Story Content Management
- **Database**: `storydb` (MySQL)
- **Responsibilities**:
  - Story CRUD operations
  - Character management
  - Timeline/Scene management
  - Genre classification
  - Like/Favorite/Comment system
  - Media upload (images, videos, audio)
  - Story statistics (views, popularity)
- **Key Features**:
  - Multi-image support for stories and characters
  - Scene timeline viewer
  - AI content generation integration (placeholder)
  - Genre-based filtering

### New Services (Recommended)

#### 5. **Config Server** (Port 8888) [IMPLEMENTED]
- **Purpose**: Centralized Configuration Management
- **Technology**: Spring Cloud Config
- **Responsibilities**:
  - External configuration management
  - Environment-specific properties
  - Dynamic configuration refresh
  - Encrypted property values

#### 6. **Monitoring Service** (Port 8083) [PLANNED]
- **Purpose**: Application Health & Metrics
- **Technology**: Spring Boot Actuator + Micrometer
- **Responsibilities**:
  - Health checks for all services
  - Performance metrics
  - Custom business metrics
  - Alerting integration

## 🔄 Communication Patterns

### Synchronous Communication
- **REST APIs**: All inter-service communication
- **Service Discovery**: Via Eureka for dynamic routing
- **Load Balancing**: Client-side load balancing with Ribbon

### Frontend-Backend Communication
- **Protocol**: HTTP/HTTPS
- **API Gateway**: Single entry point at `localhost:8080`
- **Authentication**: JWT token in Authorization header
- **Error Handling**: Standardized error responses

## 🛡️ Security Architecture

### Authentication Flow
1. User logs in via `/api/auth/login`
2. User Service validates credentials
3. JWT token generated and returned
4. Client stores token (localStorage)
5. Token sent with each request in Authorization header
6. Gateway validates token before routing

### Security Features
- **JWT Authentication**: Stateless authentication
- **Password Hashing**: BCrypt encryption
- **Email Verification**: Secure account activation
- **Password Reset**: Time-limited 5-digit codes
- **OAuth2 Integration**: Google & Microsoft SSO
- **CORS Configuration**: Controlled cross-origin access
- **Account Security**: Failed login tracking, account locking

## 📊 Data Architecture

### Database Design

#### User Service Database (userdb)
- **users**: User accounts and credentials
- **password_reset_codes**: Temporary password reset codes
- **failed_login_attempts**: Security tracking
- **login_audit_logs**: Login history

#### Story Service Database (storydb)
- **stories**: Main story content
- **characters**: Story characters with multiple images
- **scenes**: Timeline entries with multimedia
- **scene_media**: Media files for scenes
- **genres**: Story categories
- **story_genres**: Many-to-many story-genre mapping
- **likes**: User story likes
- **favorites**: User story favorites
- **comments**: Story comments
- **story_views**: View tracking and analytics

## 🚀 Deployment Architecture

### Local Development
- MySQL: `localhost:3306`
- Eureka: `localhost:8761`
- Gateway: `localhost:8080`
- User Service: `localhost:8081`
- Story Service: `localhost:8082`
- Config Server: `localhost:8888`
- Frontend: `localhost:5173`

### Startup Sequence
1. **MySQL Database** (External)
2. **Config Server** (8888) - If using centralized config
3. **Eureka Server** (8761) - Service discovery
4. **User Service** (8081) - Registers with Eureka
5. **Story Service** (8082) - Registers with Eureka
6. **API Gateway** (8080) - Routes to registered services
7. **Frontend** (5173) - Connects to Gateway

## 🔧 Configuration Management

### Current Approach
- Properties files in each service
- Environment-specific configurations
- Database credentials hardcoded (development)

### Recommended Approach (Config Server)
```
config-repo/
├── user-service.yml
├── story-service.yml
├── api-gateway.yml
├── user-service-dev.yml
├── user-service-prod.yml
└── application.yml
```

## 📈 Monitoring & Observability

### Planned Features
- **Health Endpoints**: `/actuator/health` for all services
- **Metrics**: Custom business metrics
- **Logging**: Centralized logging with correlation IDs
- **Tracing**: Distributed tracing (future: Sleuth + Zipkin)

## 🎯 Best Practices Implemented

### Backend
- ✅ Service-oriented architecture
- ✅ Single Responsibility Principle
- ✅ RESTful API design
- ✅ Input validation with Bean Validation
- ✅ Exception handling with @ControllerAdvice
- ✅ Transaction management
- ✅ DTOs for data transfer
- ✅ Repository pattern for data access

### Frontend
- ✅ TypeScript for type safety
- ✅ Feature-based folder structure
- ✅ Reusable component library
- ✅ Centralized API service layer
- ✅ Error boundary implementation
- ✅ Responsive design with Tailwind CSS
- ✅ Authentication state management

## 🔮 Future Enhancements

### Technical Improvements
1. **Message Queue**: Add RabbitMQ/Kafka for async operations
2. **Caching**: Redis for session management and caching
3. **Search**: Elasticsearch for advanced story search
4. **File Storage**: AWS S3 or MinIO for media files
5. **CDN**: CloudFront or similar for static assets
6. **API Documentation**: Swagger/OpenAPI for all services
7. **Testing**: Comprehensive unit and integration tests
8. **CI/CD**: Automated build and deployment pipeline

### Business Features
1. **Real-time Collaboration**: WebSocket support for co-authoring
2. **AI Integration**: OpenAI for content generation
3. **Social Features**: User following, feed, notifications
4. **Analytics Dashboard**: Story performance metrics
5. **Payment Integration**: Premium features
6. **Mobile Apps**: React Native or Flutter
7. **Export Features**: PDF, EPUB generation

## 📚 Technology Stack

### Backend
- **Framework**: Spring Boot 3.2.0
- **Language**: Java 21
- **Service Discovery**: Netflix Eureka
- **API Gateway**: Spring Cloud Gateway
- **Database**: MySQL 8.x
- **ORM**: Spring Data JPA / Hibernate
- **Security**: Spring Security + JWT
- **Email**: Spring Mail
- **Testing**: JUnit, Mockito
- **Build Tool**: Maven

### Frontend
- **Framework**: React 18
- **Language**: TypeScript 5
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 3
- **HTTP Client**: Fetch API
- **Router**: React Router 7
- **Icons**: Lucide React

### DevOps
- **Version Control**: Git
- **Database**: MySQL
- **Package Management**: Maven (BE), npm (FE)
- **Development**: Hot reload, Source maps

## 🔐 Environment Variables

### User Service
```properties
# Database
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=userdb
MYSQL_USER=root
MYSQL_PASSWORD=root

# JWT
JWT_SECRET=<strong-secret-key>
JWT_EXPIRATION=86400000

# Email
MAIL_HOST=smtp.gmail.com
MAIL_USERNAME=<your-email>
MAIL_PASSWORD=<app-password>

# OAuth2
GOOGLE_CLIENT_ID=<client-id>
GOOGLE_CLIENT_SECRET=<client-secret>
MICROSOFT_CLIENT_ID=<client-id>
MICROSOFT_CLIENT_SECRET=<client-secret>
```

### Story Service
```properties
# Database
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=storydb
MYSQL_USER=root
MYSQL_PASSWORD=root

# File Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10MB
MAX_REQUEST_SIZE=50MB
```

## 📖 API Documentation

### Authentication Endpoints
- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login
- POST `/api/auth/forgot-password` - Request password reset
- POST `/api/auth/reset-password` - Reset password with code
- GET `/api/auth/verify-email` - Verify email with token

### Story Endpoints
- GET `/api/stories` - List all stories
- POST `/api/stories` - Create new story
- GET `/api/stories/{id}` - Get story details
- PUT `/api/stories/{id}` - Update story
- DELETE `/api/stories/{id}` - Delete story
- GET `/api/stories/my-stories` - Get current user's stories
- POST `/api/stories/{id}/like` - Like/unlike story
- POST `/api/stories/{id}/favorite` - Favorite/unfavorite story
- GET `/api/stories/genres` - List all genres

## 📝 Maintenance Notes

- **Database**: Automatic schema creation with `spring.jpa.hibernate.ddl-auto=update`
- **Ports**: Ensure all ports are free before starting services
- **Eureka**: Wait 30 seconds after Eureka startup for services to register
- **CORS**: Configured for `localhost:5173` in development
- **File Uploads**: Stored in `uploads/` directory relative to story-service

## 🆘 Troubleshooting

### Common Issues
1. **Port Already in Use**: Stop existing services or change port
2. **Eureka Connection Failed**: Ensure Eureka Server is running
3. **Database Connection Failed**: Verify MySQL is running and credentials are correct
4. **Frontend API Errors**: Check API Gateway is running on port 8080
5. **JWT Token Expired**: Re-login to get new token

### Health Check Commands
```bash
# Check Eureka Dashboard
http://localhost:8761

# Check service health
curl http://localhost:8081/actuator/health
curl http://localhost:8082/actuator/health

# Check service registration
curl http://localhost:8761/eureka/apps
```
