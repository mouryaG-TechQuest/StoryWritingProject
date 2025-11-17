# Character Multiple Images Feature

## ✅ Implementation Complete

Each character can now have **multiple images** instead of just one profile picture.

## Backend Changes

### Database Schema
- **New Table**: `character_images` 
  - Stores multiple image URLs per character
  - Uses `@ElementCollection` with eager fetching
  - Junction table: `character_id` → multiple `image_url` entries

### Updated Models
- `Character.java`: Changed `String imageUrl` → `List<String> imageUrls`
- `CharacterRequest.java`: Changed to support `List<String> imageUrls`
- `CharacterResponse.java`: Changed to return `List<String> imageUrls`

### Service Layer
- `StoryService.java`: Updated all methods to use `imageUrls` list
- Character creation, update, and retrieval now handle multiple images

### Image Upload API
Enhanced `/api/stories/upload-images` endpoint:
```java
POST /api/stories/upload-images?type=character
Content-Type: multipart/form-data
Authorization: Bearer <token>

// Upload multiple files at once
FormData with multiple files → Returns array of URLs
```

## Frontend Changes

### StoryForm Component
**Character Image Upload Section:**
- ✅ Support for multiple image uploads
- ✅ Grid display (2-4 columns responsive)
- ✅ Individual delete buttons for each image
- ✅ Image counter badge showing total images
- ✅ "Add More Images" button when images exist
- ✅ Mobile-responsive layout

**Key Features:**
```tsx
// Upload multiple images
<input type="file" accept="image/*" multiple />

// Display in responsive grid
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
  {char.imageUrls.map((url, idx) => (
    <img src={url} />
    <button onClick={() => removeCharacterImage(charIdx, imgIdx)} />
  ))}
</div>
```

### Character Interface
```typescript
interface Character {
  id?: string;
  name: string;
  description: string;
  role: string;
  actorName?: string;
  imageUrls?: string[];  // Array instead of single string
}
```

## Usage Guide

### Adding Multiple Character Images

1. **Create/Edit Character** in the Characters tab
2. **Click "Upload Images"** button
3. **Select multiple image files** (Ctrl/Cmd + Click)
4. Images are uploaded and displayed in a grid
5. **Add more images** anytime with "Add More Images" button
6. **Remove individual images** with the X button on hover

### Image Organization
- Character images stored in: `uploads/characters/`
- Automatic filename sanitization
- UUID prefix prevents naming conflicts
- Images resized if larger than 2048x2048

### Display Features
- **Responsive grid**: 2 columns on mobile, up to 4 on desktop
- **Hover effects**: Delete button appears on hover
- **Error handling**: SVG placeholder for broken images
- **Image counter**: Shows total count `(3)` next to label

## API Examples

### Upload Multiple Character Images
```javascript
const formData = new FormData();
characterImages.forEach(file => {
  formData.append('files', file);
});
formData.append('type', 'character');

const response = await fetch('http://localhost:8080/api/stories/upload-images', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});

const imageUrls = await response.json();
// Returns: ["/uploads/characters/uuid_img1.jpg", "/uploads/characters/uuid_img2.png"]
```

### Character Data Structure
```json
{
  "name": "John Doe",
  "description": "Main protagonist",
  "role": "Hero",
  "actorName": "Tom Hanks",
  "imageUrls": [
    "/uploads/characters/uuid_profile.jpg",
    "/uploads/characters/uuid_action_shot.jpg",
    "/uploads/characters/uuid_costume.png"
  ]
}
```

## Benefits

1. **Character Flexibility**: Show different angles, costumes, expressions
2. **Casting Options**: Multiple actor photos for casting decisions
3. **Story Development**: Track character evolution with different images
4. **Better Visualization**: More complete character representation
5. **Organized Storage**: All character images in dedicated directory

## Database Migration

Hibernate automatically creates the `character_images` table:
```sql
CREATE TABLE character_images (
  character_id BIGINT NOT NULL,
  image_url VARCHAR(255),
  FOREIGN KEY (character_id) REFERENCES characters(id)
);
```

**Note**: Existing single `image_url` column in `characters` table is replaced by this new structure.

## Testing Checklist

- ✅ Upload single character image
- ✅ Upload multiple character images at once
- ✅ Add more images to existing character
- ✅ Delete individual character images
- ✅ View character with multiple images in story detail
- ✅ Edit character and modify images
- ✅ Responsive layout on mobile/tablet/desktop
- ✅ Error handling for failed uploads
- ✅ Image URL validation and fallbacks

## Compatibility

- **Backend**: Spring Boot 3.2.0, JPA with @ElementCollection
- **Frontend**: React 18 + TypeScript
- **Database**: MySQL with automatic schema updates
- **Images**: JPEG, PNG, GIF, WEBP supported
- **File Size**: Max 10MB per image, 50MB total request

## Next Steps

All features are working! Characters can now have multiple images throughout your application.

**Refresh your browser to see the changes in action!**
