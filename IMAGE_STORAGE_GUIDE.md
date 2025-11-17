# Image Storage System Guide

## Overview
Improved image storage with organized directories, validation, automatic resizing, and better security.

## Directory Structure
```
uploads/
├── stories/        # Story cover images and general story images
├── characters/     # Character profile images
└── scenes/         # Timeline/scene images
```

## Features

### ✅ Organized Storage
- **Stories**: `uploads/stories/` - Main story images
- **Characters**: `uploads/characters/` - Character profile pictures  
- **Scenes**: `uploads/scenes/` - Timeline and scene images

### ✅ Image Validation
- **Allowed formats**: JPEG, JPG, PNG, GIF, WEBP
- **Max file size**: 10MB per file
- **Max request size**: 50MB total
- **MIME type checking**: Validates actual image content

### ✅ Automatic Optimization
- **Auto-resize**: Images larger than 2048x2048 are automatically resized
- **Aspect ratio**: Maintained during resize
- **Quality**: Optimized for web display
- **Performance**: 1-hour browser caching enabled

### ✅ Security
- **Filename sanitization**: Removes special characters
- **Unique filenames**: UUID prefix prevents conflicts
- **CORS enabled**: Allows frontend access from localhost:5173
- **Public read access**: Anyone can view images
- **Authenticated uploads**: Requires JWT token to upload

## API Endpoints

### Upload Images
```http
POST /api/stories/upload-images
Content-Type: multipart/form-data
Authorization: Bearer <token>

Parameters:
- files: MultipartFile[] (required) - Array of image files
- type: string (optional) - "story" | "character" | "scene" (default: "story")
```

**Response:**
```json
["uploads/stories/uuid_image1.jpg", "/uploads/stories/uuid_image2.png"]
```

### Delete Image
```http
DELETE /api/stories/delete-image?url=/uploads/stories/uuid_image.jpg
Authorization: Bearer <token>
```

## Frontend Usage

### Upload Story Images
```javascript
const formData = new FormData();
files.forEach(file => formData.append('files', file));
formData.append('type', 'story');

const response = await fetch('http://localhost:8080/api/stories/upload-images', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});

const imageUrls = await response.json();
```

### Upload Character Image
```javascript
const formData = new FormData();
formData.append('files', characterImageFile);
formData.append('type', 'character');

const response = await fetch('http://localhost:8080/api/stories/upload-images', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});

const [imageUrl] = await response.json();
```

### Upload Scene Images
```javascript
const formData = new FormData();
sceneImages.forEach(img => formData.append('files', img));
formData.append('type', 'scene');

const response = await fetch('http://localhost:8080/api/stories/upload-images', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});

const imageUrls = await response.json();
```

### Display Images
```tsx
// Images are served publicly from /uploads/**
<img 
  src={url.startsWith('http') ? url : `http://localhost:8080${url}`}
  alt="Story image"
  onError={(e) => {
    e.target.src = 'data:image/svg+xml,...'; // Fallback
  }}
/>
```

## Configuration

### application.properties
```properties
# File Upload Limits
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=50MB

# Image Storage
image.upload.dir=uploads
image.max-width=2048
image.max-height=2048
image.allowed-types=image/jpeg,image/jpg,image/png,image/gif,image/webp
```

## Benefits

1. **Better Organization**: Separate directories for different image types
2. **Easy Maintenance**: Find and manage images by type
3. **Automatic Optimization**: Large images are automatically resized
4. **Validation**: Only valid image formats are accepted
5. **Security**: Proper authentication for uploads, public read access
6. **Performance**: Browser caching reduces server load
7. **Error Handling**: Detailed error messages for debugging
8. **Scalability**: Easy to extend for new image types

## Troubleshooting

### 403 Forbidden Error
- **Cause**: Security configuration blocking access
- **Solution**: Already fixed - `/uploads/**` is now public

### Images Not Loading
- **Check**: URL format should be `/uploads/stories/uuid_filename.ext`
- **Check**: File exists in correct directory
- **Check**: CORS is enabled for localhost:5173

### Upload Fails
- **Check**: File size < 10MB
- **Check**: File type is JPEG, PNG, GIF, or WEBP
- **Check**: JWT token is valid and included
- **Check**: Directory permissions allow write access

## Migration from Old System

Old system stored everything in `uploads/stories/`. New images are automatically organized:
- Story images → `uploads/stories/`
- Character images → `uploads/characters/`
- Scene images → `uploads/scenes/`

Existing images remain accessible at their current paths.
