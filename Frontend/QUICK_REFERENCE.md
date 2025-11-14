# Story Writing App - Quick Reference Guide

## 🎯 Component Quick Reference

### Core Application

```typescript
// App.tsx - Main Application Container
App
├── Handles: Authentication, Story CRUD, State Management
├── Props: None (Root Component)
├── State Variables:
│   ├── user: { username, token }
│   ├── stories: Story[]
│   ├── myStories: Story[]
│   ├── view: 'all' | 'my'
│   ├── showForm: boolean
│   ├── editingStory: Story | null
│   ├── formData: { title, content, characters }
│   └── loading: boolean
├── Key Methods:
│   ├── fetchStories(token)
│   ├── handleSubmitStory(e)
│   ├── handleDeleteStory(id)
│   ├── handleEditStory(story)
│   ├── handleAuth(userData)
│   └── logout()
└── Renders:
    ├── AuthPage (if not logged in)
    └── Main App (if logged in)
```

### Pages

```typescript
// Auth.tsx - Authentication Page
Auth
├── Props:
│   └── onAuth: (user) => void
├── State:
│   ├── authForm: { username, password, email, isLogin }
│   ├── error: string
│   └── loading: boolean
├── Features:
│   ├── Login form
│   ├── Register form
│   └── Toggle between login/register
└── Emits:
    └── onAuth callback with { username, token }
```

### Layout Components

```typescript
// Header.tsx - Navigation Bar
Header
├── Props:
│   ├── user: { username, token }
│   └── onLogout: () => void
├── Displays:
│   ├── App logo and title
│   ├── Current username
│   └── Logout button
└── Actions:
    └── Logout on button click
```

### Story Management

```typescript
// StoryViewToggle.tsx - View Switcher
StoryViewToggle
├── Props:
│   ├── view: 'all' | 'my'
│   ├── onViewChange: (view) => void
│   ├── allStoriesCount: number
│   ├── myStoriesCount: number
│   ├── onNewStory: () => void
│   └── showForm: boolean
├── Features:
│   ├── Two toggle buttons (All/My)
│   ├── Story counts display
│   └── New story button
└── Emits:
    ├── View change event
    └── New story click event
```

```typescript
// StoryForm.tsx - Create/Edit Form
StoryForm
├── Props:
│   ├── formData: { title, content, characters }
│   ├── setFormData: (data) => void
│   ├── onSubmit: (e) => Promise<void>
│   ├── onCancel: () => void
│   ├── loading: boolean
│   └── isEditing: boolean
├── Input Fields:
│   ├── Title (text input)
│   ├── Content (textarea)
│   └── Characters (dynamic list)
├── Character Operations:
│   ├── Add character button
│   ├── Remove character button
│   └── Update character fields
└── Actions:
    ├── Submit (Create/Update)
    └── Cancel (Close form)
```

```typescript
// StoryCard.tsx - Story Display
StoryCard
├── Props:
│   ├── story: Story
│   ├── isOwner: boolean
│   ├── onEdit: () => void
│   └── onDelete: () => void
├── Displays:
│   ├── Story title
│   ├── Author name
│   ├── Content preview (3 lines)
│   ├── Characters list
│   ├── Creation date
│   └── Edit/Delete buttons (if owner)
└── Character Display:
    ├── Character name
    ├── Character role (badge)
    └── Character description
```

```typescript
// EmptyState.tsx - No Content View
EmptyState
├── Props:
│   └── view: 'all' | 'my'
├── Shows:
│   ├── Empty state icon
│   ├── Contextual message
│   └── Call-to-action text
└── Messages:
    ├── "You haven't written any stories yet" (if my)
    └── "No stories available" (if all)
```

### Utility Components

```typescript
// Loader.tsx - Loading Spinner
Loader
├── Props:
│   ├── isLoading?: boolean
│   └── size?: 'small' | 'medium' | 'large'
├── Renders:
│   ├── Animated spinner (if loading true)
│   └── Nothing (if loading false)
└── Sizes:
    ├── small: 8x8px
    ├── medium: 12x12px (default)
    └── large: 16x16px
```

## 🔌 API Integration

### Endpoints Used

```javascript
// Base URL
const API_BASE = 'http://localhost:8080/api';

// Authentication
POST   /auth/login
POST   /auth/register

// Stories (all require Bearer token)
GET    /stories           // All stories
GET    /stories/my-stories // User's stories
POST   /stories           // Create story
PUT    /stories/{id}      // Update story
DELETE /stories/{id}      // Delete story
```

### Request Headers

```javascript
// Public endpoints (Auth)
{
  'Content-Type': 'application/json'
}

// Protected endpoints
{
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
}
```

## 🎨 Color Palette

```css
/* Primary */
--primary-purple: #9333ea (purple-600)
--primary-dark: #7e22ce (purple-700)
--primary-light: #f9f5ff (purple-50)

/* Status */
--success: #10b981 (green)
--warning: #f59e0b (amber)
--danger: #ef4444 (red)
--info: #3b82f6 (blue)

/* Text & Background */
--text-dark: #1f2937 (gray-800)
--text-light: #9ca3af (gray-400)
--bg-light: #f9fafb (gray-50)
--bg-white: #ffffff
```

## 📊 TypeScript Interfaces

```typescript
interface User {
  username: string;
  token: string;
}

interface Character {
  id?: string;
  name: string;
  description: string;
  role: string;
}

interface Story {
  id: string;
  title: string;
  content: string;
  authorUsername: string;
  characters: Character[];
  createdAt: string;
}

interface FormData {
  title: string;
  content: string;
  characters: Character[];
}

interface AuthFormData {
  username: string;
  password: string;
  email: string;
  isLogin: boolean;
}
```

## 🔄 Common Patterns

### Fetching Data
```typescript
const fetchStories = async (token: string) => {
  setLoading(true);
  try {
    const response = await fetch(`${API_BASE}/stories`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    setStories(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

### Form Submission
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  try {
    const response = await fetch(`${API_BASE}/stories`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${user?.token}` },
      body: JSON.stringify(formData)
    });
    // Handle success
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

### State Updates
```typescript
// Array state update
setFormData({
  ...formData,
  characters: [...formData.characters, newCharacter]
});

// Object state update
setAuthForm({ ...authForm, isLogin: !authForm.isLogin });

// localStorage
localStorage.setItem('token', token);
localStorage.removeItem('token');
```

## 🧭 Navigation Flow

```
Start
  ↓
Check localStorage for token
  ├─ Token exists → Show Main App
  │   ├─ View All Stories (default)
  │   │   ├─ Click Story → See details
  │   │   ├─ Click Edit → Show form (if owner)
  │   │   ├─ Click Delete → Confirm & delete
  │   │   └─ Click New Story → Show form
  │   │
  │   ├─ Switch to My Stories
  │   │   └─ Same operations as above
  │   │
  │   └─ Click Logout → Clear localStorage → Show Auth
  │
  └─ No token → Show Auth Page
      ├─ Toggle to Login (default)
      │   ├─ Enter username & password
      │   └─ Submit → Get token → Show Main App
      │
      └─ Toggle to Register
          ├─ Enter username, email, password
          └─ Submit → Create account → Get token → Show Main App
```

## ⚠️ Important Notes

### LocalStorage Keys
- `token` - JWT authentication token
- `username` - Current user's username

### Clearing Session
When logout is clicked:
```javascript
localStorage.removeItem('token');
localStorage.removeItem('username');
setUser(null);
setStories([]);
setMyStories([]);
```

### Error Handling
All errors are caught and displayed to user via:
```jsx
{error && (
  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
    <AlertCircle className="w-5 h-5 mr-2" />
    <span>{error}</span>
  </div>
)}
```

### Loading States
- `loading` state prevents button clicks during API calls
- `disabled={loading}` on submit buttons
- Loading spinner shown while fetching stories
- "Processing..." text on buttons

---

**Quick Start**: 
1. User authenticates → Gets token → Token stored
2. App fetches stories with token
3. User can create/edit/delete their own stories
4. All stories visible to all authenticated users
5. Logout clears everything

