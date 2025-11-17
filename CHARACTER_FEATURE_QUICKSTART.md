# Quick Setup Guide for Character Image Feature

## Step 1: Apply Database Migration

Run this command in your terminal:

```bash
mysql -u root -p storydb < microservices\story-service\add-character-image.sql
```

Or manually run this SQL command in MySQL Workbench or command line:

```sql
USE storydb;
ALTER TABLE characters ADD COLUMN image_url VARCHAR(500);
```

## Step 2: Restart All Services

Run the batch file:

```bash
run-all.bat
```

Or start services individually:
1. Eureka Server (port 8761)
2. User Service (port 8081)
3. Story Service (port 8082)
4. API Gateway (port 8080)
5. Frontend (port 5173)

## Step 3: Test the New Features

1. **Login** with your test user: `testuser123` / `Test@1234`

2. **Create or Edit a Story**:
   - Go to "Characters" tab
   - Click "Add Character" button (top right)

3. **Fill Character Details**:
   - Character Name (required)
   - Actor Name (optional)
   - Role (optional)
   - Description (optional)

4. **Upload Character Image**:
   - Click "Upload Image" button
   - Select an image file
   - Image preview will appear
   - Click X to remove if needed

5. **Save Character**:
   - For NEW characters: Click green "Add Character" button
   - For EXISTING characters: Click blue "Update Character" button
   - Success alert will confirm the save

6. **Test Features**:
   - ✅ Characters don't jump when expanding/collapsing
   - ✅ Each character can be independently saved/updated
   - ✅ Character images display correctly
   - ✅ Search by character or actor name
   - ✅ Filter by Character Name A-Z or Actor Name A-Z
   - ✅ View All mode shows character cards with images

## Features Explained

### Character Management:
- **Auto-minimize on Add**: When adding a new character, all others collapse
- **Smooth Animations**: Characters expand/collapse without layout shifts
- **Individual Save/Update**: Each character has its own Add/Update button
- **Image Upload**: Each character can have a profile image
- **Search & Filter**: Find characters quickly by name or actor

### Visual Indicators:
- 🟢 **Green "Add Character"** button = New character (not saved yet)
- 🔵 **Blue "Update Character"** button = Existing character (has ID)
- 🔍 **Search bar** = Filter by character or actor name in real-time
- 🎯 **Filter icon** = Access sort options (Character A-Z, Actor A-Z)

### Layout Improvements:
- Characters use smooth `maxHeight` transitions
- No more jumping when expanding/collapsing
- Fixed positioning prevents content shifts
- Clean, professional appearance

## Troubleshooting

### If character images don't show:
1. Check that `/uploads` route is configured in API Gateway
2. Verify images are in `microservices/story-service/uploads/stories/`
3. Check browser console for 404 errors

### If Add/Update buttons don't work:
1. Check browser console for API errors
2. Verify Story Service is running on port 8082
3. Check that JWT token is valid (re-login if needed)

### If database migration fails:
1. Make sure MySQL is running
2. Verify database name is `storydb`
3. Check that you have ALTER TABLE permissions

## API Endpoints Added

```
POST   /api/stories/characters          - Create character
PUT    /api/stories/characters/{id}     - Update character
GET    /api/stories/characters           - Get all user characters
DELETE /api/stories/characters/{id}     - Delete character
```

All endpoints require authentication (JWT token in Authorization header).
