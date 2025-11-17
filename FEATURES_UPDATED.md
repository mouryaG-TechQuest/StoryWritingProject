# Story Writing Project - Enhanced Features

## 🎉 New Features Added

### 1. **Created Date Visibility**
- All stories now display creation timestamp
- Visible on story cards and in detail modal
- Automatically captured using `@CreationTimestamp` in backend

### 2. **Story Images**
- Authors can upload multiple images per story
- Images displayed in story cards (first image as banner)
- Full gallery view in story detail modal
- Upload endpoint: `POST /api/stories/upload-images`
- Supports multiple image formats
- Images stored in `uploads/stories/` directory

### 3. **Actor Names for Characters**
- Characters now have both `name` (character name in story) and `actorName` (real person playing the role)
- Actor names prominently displayed in cast lists
- Separate fields in character form

### 4. **Story Description**
- Short description field (max 500 chars) for story preview
- Displayed on story cards
- Full content shown only in detail modal

### 5. **Timeline Feature**
- JSON-based timeline for story events
- Structure: `[{"event": "Opening", "characters": ["Hero"], "description": "Story begins"}]`
- Visual timeline display in detail modal
- Helps track story progression and character involvement

### 6. **Enhanced UI/UX**
- **Story Cards:**
  - Image banner at top
  - Gradient backgrounds
  - Hover effects with scale animations
  - Better spacing and typography
  - Shows image count badge
  
- **Story Form:**
  - Organized sections for description, content, images, timeline, and characters
  - Image upload with preview
  - Actor name field for each character
  - Timeline JSON editor with helper button
  
- **Detail Modal:**
  - Full-screen responsive modal
  - Gradient header
  - Image gallery grid
  - Timeline visualization
  - Enhanced character cards with actor names

## 📂 Database Schema Changes

### `stories` table additions:
- `created_at` (TIMESTAMP) - Auto-generated creation date
- `description` (VARCHAR(500)) - Short story description
- `timeline_json` (TEXT) - JSON timeline data

### `characters` table additions:
- `actor_name` (VARCHAR) - Name of person playing the character

### New `story_images` table:
- `id` (BIGINT) - Primary key
- `url` (VARCHAR) - Image file path/URL
- `story_id` (BIGINT) - Foreign key to stories

## 🔧 API Updates

### New Endpoint
```
POST /api/stories/upload-images
Content-Type: multipart/form-data
Authorization: Bearer {token}

Request: files[] (MultipartFile array)
Response: ["url1", "url2", ...]
```

### Updated DTOs
All story request/response DTOs now include:
- `description`
- `timelineJson`
- `imageUrls` (array of strings)
- `createdAt` (LocalDateTime in response)
- `actorName` (in CharacterRequest/Response)

## 🚀 Usage Guide

### Creating a Story with New Features:

1. **Fill Basic Info:**
   - Title (required)
   - Short Description (optional, shown in preview)
   - Full Content (required)

2. **Upload Images:**
   - Click "Upload Images" button
   - Select one or multiple images
   - Preview shows all uploaded images
   - Remove unwanted images with X button

3. **Add Timeline (Optional):**
   - Use JSON format or click "Add Entry" button
   - Example: `[{"event":"Act 1","characters":["Hero","Villain"],"description":"Opening scene"}]`

4. **Add Characters:**
   - Character Name (name in the story)
   - Actor Name (real person playing role) - NEW!
   - Role (e.g., Protagonist, Antagonist)
   - Description

### Viewing Stories:

- **Card View:** Shows first image, description preview, created date, cast
- **Detail Modal:** Full images, timeline, complete cast with actor names, full content

## 🎨 Design Improvements

- Modern gradient accents (purple to blue)
- Responsive grid layouts
- Smooth hover animations
- Better visual hierarchy
- Emoji icons for sections
- Shadow and border effects

## 🔒 Security

- Image uploads require authentication
- File size limits: 10MB per file, 50MB per request
- Images stored server-side with unique UUIDs
- Only authorized users can upload

## 📱 Responsive Design

- Mobile-friendly modal and cards
- Grid layouts adapt to screen size
- Touch-optimized buttons
- Scrollable content areas

## 🛠️ Technical Stack

**Backend (Microservices):**
- Spring Boot with JPA/Hibernate
- MySQL database
- JWT authentication
- Multipart file upload support

**Frontend:**
- React with TypeScript
- Tailwind CSS for styling
- Lucide React for icons
- Fetch API for HTTP requests

## 📝 Notes

- Timeline uses JSON format for flexibility
- Images are served from `/uploads/stories/` path
- Actor names are optional but recommended
- Description helps users decide whether to read full story
