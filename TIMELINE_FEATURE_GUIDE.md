# Scene Timeline Feature - Complete Guide

## Overview
The Scene Timeline feature provides a **YouTube-style progress bar** interface for story navigation, allowing readers to explore stories scene-by-scene and editors to easily manage and edit individual scenes.

## Features

### For Readers (All Users)
✅ **Interactive Timeline Bar** - Click on any scene bar to jump directly to that scene
✅ **Scene Navigation** - Previous/Next buttons for sequential reading
✅ **Visual Progress** - Color-coded scene bars showing current position
✅ **Scene Content** - View scene descriptions, images, and characters
✅ **Character Highlighting** - Character names are highlighted with consistent colors
✅ **Quick Jump Grid** - Grid view for rapid navigation between scenes
✅ **Hover Tooltips** - Preview scene titles by hovering over timeline bars

### For Editors (Story Owners Only)
🔧 **Edit Scene Button** - Quick access to edit any scene
🔧 **Editor Mode Indicators** - Visual cues showing edit capabilities
🔧 **Direct Scene Editing** - Click timeline bar to navigate and edit
🔧 **Full Story Edit** - Edit entire story structure from header

## User Interface Components

### 1. Scene Timeline Bar (YouTube-style)
```
┌────────────────────────────────────────────────────────┐
│ Scene 1 of 10                         [Edit Scene]      │
├────────────────────────────────────────────────────────┤
│ [1][2][3][4][5][6][7][8][9][10]                        │
│  ▲ Active scene highlighted                             │
├────────────────────────────────────────────────────────┤
│ [◄ Previous]    Scene Title          [Next ►]          │
└────────────────────────────────────────────────────────┘
```

**Features:**
- **Color-coded bars**: Each scene has a unique color (blue, purple, pink, red, orange, yellow, green, teal, cyan, indigo)
- **Active indicator**: Current scene has white top border and pulse animation
- **Hover tooltips**: Show scene titles when hovering
- **Click to jump**: Click any bar to navigate to that scene
- **Auto-scroll**: Timeline automatically centers on current scene

### 2. Scene Content Display
Each scene shows:
- **Scene Number & Title** (in color-matched header)
- **Cast Members** (character badges with actor names)
- **Scene Images** (grid layout)
- **Scene Description** (with character name highlighting)

### 3. Quick Jump Grid
Grid of scene cards showing:
- Scene number
- Scene title
- Character count
- Active scene highlighted

### 4. View Mode Toggle (Header)
Two viewing modes:
- **🎬 Scene Timeline**: Interactive scene-by-scene navigation
- **📖 Full Story**: Traditional complete story view

## Implementation Details

### Components

#### SceneTimelineViewer.tsx
Main component for timeline visualization and navigation.

**Props:**
```typescript
interface SceneTimelineViewerProps {
  timeline: TimelineEntry[];        // Array of scenes
  characters: Character[];          // Story characters
  onEditScene?: (index: number) => void;  // Edit callback
  isEditorView?: boolean;          // Show editor controls
}
```

**Key Features:**
- Sortable timeline by order
- Color assignment (10 colors, rotates)
- Character name formatting with colors
- Auto-scroll to active scene
- Keyboard navigation support

#### StoryDetailModal.tsx
Enhanced modal with timeline integration.

**Props:**
```typescript
interface StoryDetailModalProps {
  story: Story;
  onClose: () => void;
  onEdit?: (story: Story, sceneIndex?: number) => void;
  currentUsername?: string;
}
```

**Features:**
- View mode switching (Timeline/Full)
- Edit button for story owners
- Scene-specific editing
- Responsive layout

### Data Structure

#### TimelineEntry
```typescript
interface TimelineEntry {
  id: string;              // Unique identifier
  event: string;           // Scene title
  description: string;     // Scene content
  characters: string[];    // Character names in scene
  imageUrls: string[];     // Scene images
  order: number;          // Scene sequence
}
```

#### Story (with Timeline)
```typescript
interface Story {
  id: string;
  title: string;
  content: string;
  description?: string;
  timelineJson?: string;      // JSON serialized timeline
  imageUrls?: string[];
  authorUsername: string;
  characters: Character[];
  createdAt: string;
  isPublished?: boolean;
}
```

## User Workflows

### Reader Workflow
1. Open story detail modal
2. View "Scene Timeline" tab (default)
3. See interactive timeline bar with all scenes
4. Click on any scene bar OR use Previous/Next buttons
5. Read scene content with highlighted characters
6. View scene-specific images
7. Use Quick Jump grid for rapid navigation
8. Switch to "Full Story" view for complete text

### Editor Workflow
1. Open own story detail modal
2. Click "Edit Story" button in header (edits full story)
3. OR navigate to specific scene and click "Edit Scene"
4. Scene editor opens with:
   - Scene title
   - Scene description
   - Character selection
   - Image uploads
5. Save changes and return to timeline view

### Creating Stories with Timeline
1. Go to "Write Story" tab in story form
2. Click "Add Timeline Entry"
3. For each scene:
   - Add scene title
   - Select characters for scene
   - Write description
   - Upload scene-specific images
4. Use up/down arrows to reorder scenes
5. Expand/collapse scenes while editing
6. Preview in "Preview Story" tab
7. Publish story

## Styling & Colors

### Scene Colors (Cycling)
```javascript
const colors = [
  'bg-blue-500',    // Scene 1, 11, 21...
  'bg-purple-500',  // Scene 2, 12, 22...
  'bg-pink-500',    // Scene 3, 13, 23...
  'bg-red-500',     // Scene 4, 14, 24...
  'bg-orange-500',  // Scene 5, 15, 25...
  'bg-yellow-500',  // Scene 6, 16, 26...
  'bg-green-500',   // Scene 7, 17, 27...
  'bg-teal-500',    // Scene 8, 18, 28...
  'bg-cyan-500',    // Scene 9, 19, 29...
  'bg-indigo-500'   // Scene 10, 20, 30...
];
```

### Character Color System
Characters are assigned consistent colors based on:
- Position in character list
- Color palette: Red, Blue, Green, Purple, Orange, Cyan, Pink, Yellow, Indigo, Teal
- Used across timeline, scenes, and previews

### Custom CSS
Added to `index.css`:
- Scrollbar styling (thin, dark theme)
- Fade-in animation
- Line-clamp utilities

## API Integration

### Timeline Storage
Timeline data is stored as JSON string in `Story.timelineJson`:

**Save:**
```javascript
const timelineJson = JSON.stringify(timeline);
// Send to backend in StoryRequest
```

**Load:**
```javascript
const timeline = JSON.parse(story.timelineJson);
timeline.sort((a, b) => a.order - b.order);
```

### Backend Model (Java)
```java
@Entity
@Table(name = "stories")
public class Story {
    // ... other fields
    
    @Lob
    @Column(name = "timeline_json", columnDefinition = "TEXT")
    private String timelineJson;
    
    // ... getters/setters
}
```

## Accessibility Features

✅ **Keyboard Navigation**: Tab through scenes, Enter to select
✅ **ARIA Labels**: Proper labeling for screen readers
✅ **Color Contrast**: High contrast text on colored backgrounds
✅ **Responsive Design**: Works on mobile, tablet, desktop
✅ **Touch Friendly**: Large tap targets for mobile users

## Performance Considerations

### Optimizations
- Timeline auto-scroll uses `requestAnimationFrame`
- Images lazy-load with native loading
- Character name regex compiled once per scene
- Scene components memoized to prevent re-renders

### Scalability
- Tested with up to 50 scenes per story
- Timeline bar scrolls horizontally for many scenes
- Quick Jump grid uses CSS Grid for efficient layout
- Virtual scrolling could be added for 100+ scenes

## Browser Compatibility

✅ Chrome/Edge (Latest)
✅ Firefox (Latest)
✅ Safari (Latest)
✅ Mobile browsers (iOS Safari, Chrome Android)

**Requirements:**
- Modern browser with ES6+ support
- CSS Grid support
- Flexbox support
- ScrollTo API support

## Future Enhancements

### Planned Features
- 🎯 Scene duration/time estimates
- 🎯 Scene comments and annotations
- 🎯 Scene-specific analytics (most viewed)
- 🎯 Collaborative editing with version history
- 🎯 Scene templates and presets
- 🎯 Export timeline to PDF/screenplay format
- 🎯 Voice narration for scenes
- 🎯 Scene transitions and effects

### Possible Improvements
- Drag-and-drop scene reordering in timeline bar
- Scene search/filter by character
- Bookmark favorite scenes
- Share specific scene URLs
- Timeline minimap for very long stories
- Scene comparison view (before/after editing)

## Troubleshooting

### Timeline Not Showing
**Issue**: Timeline bar is empty or not visible
**Solutions:**
1. Check if `story.timelineJson` exists and is valid JSON
2. Verify timeline has at least one entry
3. Ensure scenes have valid `order` property
4. Check browser console for parsing errors

### Characters Not Highlighted
**Issue**: Character names in descriptions not colored
**Solutions:**
1. Verify characters array is populated
2. Check character names match exactly (case-insensitive)
3. Use `***CharacterName***` format in descriptions
4. Ensure `getAllCharacterNames()` returns names

### Edit Button Not Showing
**Issue**: Edit scene button not visible
**Solutions:**
1. Verify `currentUsername === story.authorUsername`
2. Check `onEdit` callback is passed to modal
3. Ensure `isEditorView` prop is true
4. Confirm user is logged in

### Scene Navigation Not Working
**Issue**: Clicking scenes doesn't navigate
**Solutions:**
1. Check `goToScene()` function is bound correctly
2. Verify scene indices are valid (0 to length-1)
3. Ensure `currentSceneIndex` state updates
4. Check for JavaScript errors in console

## Testing Checklist

### Reader Experience
- [ ] Timeline bar displays all scenes
- [ ] Clicking scenes navigates correctly
- [ ] Previous/Next buttons work
- [ ] Scene content loads properly
- [ ] Character names are highlighted
- [ ] Images display correctly
- [ ] Quick Jump grid is functional
- [ ] View mode toggle works

### Editor Experience
- [ ] Edit Story button appears for owners
- [ ] Edit Scene button appears in timeline
- [ ] Scene editor opens with correct data
- [ ] Changes save successfully
- [ ] Timeline updates after edit
- [ ] Non-owners cannot edit

### Mobile Experience
- [ ] Timeline scrolls horizontally
- [ ] Touch targets are large enough
- [ ] Modals are responsive
- [ ] Images scale properly
- [ ] Navigation buttons are accessible

## Code Examples

### Basic Usage in Parent Component
```tsx
import StoryDetailModal from './components/StoryDetailModal';

function App() {
  const [selectedStory, setSelectedStory] = useState(null);
  const currentUser = useAuth();

  const handleEdit = (story, sceneIndex) => {
    // Open editor with specific scene
    if (sceneIndex !== undefined) {
      openSceneEditor(story, sceneIndex);
    } else {
      openStoryEditor(story);
    }
  };

  return (
    <>
      {selectedStory && (
        <StoryDetailModal
          story={selectedStory}
          onClose={() => setSelectedStory(null)}
          onEdit={handleEdit}
          currentUsername={currentUser?.username}
        />
      )}
    </>
  );
}
```

### Creating Timeline Data
```tsx
const timeline: TimelineEntry[] = [
  {
    id: '1',
    event: 'Opening Scene',
    description: '***John*** walks into the café...',
    characters: ['John'],
    imageUrls: ['/uploads/scene1.jpg'],
    order: 0
  },
  {
    id: '2',
    event: 'The Meeting',
    description: '***John*** meets ***Sarah***...',
    characters: ['John', 'Sarah'],
    imageUrls: ['/uploads/scene2.jpg'],
    order: 1
  }
];

const timelineJson = JSON.stringify(timeline);
```

### Character Color Highlighting
```tsx
import { getCharacterColor, getAllCharacterNames } from '../utils/characterColors';

const characters = story.characters;
const allNames = getAllCharacterNames(characters);

const renderText = (text: string, sceneCharacters: string[]) => {
  const pattern = sceneCharacters
    .map(name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  const regex = new RegExp(`\\*\\*\\*(${pattern})\\*\\*\\*`, 'gi');
  
  // Replace matches with colored spans
  return text.split(regex).map((part, i) => {
    if (i % 2 === 1) {
      const color = getCharacterColor(part, allNames);
      return <span className={color.text} key={i}>{part}</span>;
    }
    return part;
  });
};
```

## Support & Contribution

### Reporting Issues
If you encounter bugs or have feature requests:
1. Check existing documentation
2. Search for similar issues
3. Create detailed bug report with:
   - Browser and version
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable

### Contributing
To contribute improvements:
1. Fork the repository
2. Create feature branch
3. Follow existing code style
4. Add tests for new features
5. Update documentation
6. Submit pull request

---

**Version**: 1.0.0  
**Last Updated**: November 15, 2025  
**Author**: StoryWriting Project Team
