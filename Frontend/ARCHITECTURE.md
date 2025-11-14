# Story Writing Application - Frontend Architecture

## 📋 Project Overview

The Story Writing Application is a React-based web application that allows users to create, edit, delete, and view stories with character management features. The application is built with TypeScript, Tailwind CSS, and uses Lucide icons.

## 🏗️ Component Structure

### Core Components

#### **App.tsx** (Main Application Component)
- **Location**: `src/App.tsx`
- **Responsibility**: Main application component that manages:
  - User authentication state
  - Story data (all stories and user's stories)
  - View toggles (All Stories vs. My Stories)
  - Form visibility and editing state
  - API communication for CRUD operations
- **Key Props**: None (root component)
- **Key Features**:
  - Authentication check on mount
  - Fetch stories from API
  - Handle story submission (Create/Update)
  - Handle story deletion
  - Toggle between different views

#### **Layout Components**

##### **Header.tsx**
- **Location**: `src/components/layout/Header.tsx`
- **Responsibility**: Navigation bar displaying user info and logout button
- **Props**:
  ```typescript
  interface HeaderProps {
    user: { username: string; token: string };
    onLogout: () => void;
  }
  ```
- **Features**:
  - Displays app logo and title
  - Shows current user's username
  - Logout button with icon

#### **Page Components**

##### **Auth.tsx** (Authentication Page)
- **Location**: `src/pages/Auth/Auth.tsx`
- **Responsibility**: Handles user login and registration
- **Props**:
  ```typescript
  interface AuthPageProps {
    onAuth: (user: { username: string; token: string }) => void;
  }
  ```
- **Features**:
  - Login/Register toggle
  - Form validation
  - API authentication calls
  - Error handling and display

### Story Management Components

#### **StoryViewToggle.tsx**
- **Location**: `src/components/StoryViewToggle.tsx`
- **Responsibility**: Tab navigation and story creation button
- **Props**:
  ```typescript
  interface StoryViewToggleProps {
    view: 'all' | 'my';
    onViewChange: (view: 'all' | 'my') => void;
    allStoriesCount: number;
    myStoriesCount: number;
    onNewStory: () => void;
    showForm: boolean;
  }
  ```
- **Features**:
  - Toggle between "All Stories" and "My Stories"
  - Show story counts
  - Toggle form visibility

#### **StoryForm.tsx**
- **Location**: `src/components/StoryForm.tsx`
- **Responsibility**: Form for creating and editing stories
- **Props**:
  ```typescript
  interface StoryFormProps {
    formData: FormData;
    setFormData: (data: FormData) => void;
    onSubmit: (e: React.FormEvent) => Promise<void>;
    onCancel: () => void;
    loading: boolean;
    isEditing: boolean;
  }
  ```
- **Features**:
  - Story title and content input
  - Character management (add/remove/edit characters)
  - Character fields: name, role, description
  - Submit and cancel buttons
  - Loading state indication

#### **StoryCard.tsx**
- **Location**: `src/components/StoryCard.tsx`
- **Responsibility**: Display individual story card
- **Props**:
  ```typescript
  interface StoryCardProps {
    story: Story;
    isOwner: boolean;
    onEdit: () => void;
    onDelete: () => void;
  }
  ```
- **Features**:
  - Story title, content preview, and author
  - Character list display
  - Edit/Delete buttons (visible only to story owner)
  - Story creation date
  - Character role badges

### Utility Components

#### **EmptyState.tsx**
- **Location**: `src/components/EmptyState.tsx`
- **Responsibility**: Display empty state when no stories exist
- **Props**:
  ```typescript
  interface EmptyStateProps {
    view: 'all' | 'my';
  }
  ```
- **Features**:
  - Contextual messaging based on view
  - Icon display
  - Call-to-action text

#### **Loader.tsx**
- **Location**: `src/components/common/Loader.tsx`
- **Responsibility**: Loading spinner component
- **Props**:
  ```typescript
  interface LoaderProps {
    isLoading?: boolean;
    size?: 'small' | 'medium' | 'large';
  }
  ```
- **Features**:
  - Animated spinner
  - Size variants
  - Conditional rendering

## 🔄 Data Flow

### Authentication Flow
1. User enters credentials in `Auth.tsx`
2. Credentials sent to API (`/auth/login` or `/auth/register`)
3. API returns JWT token
4. Token stored in localStorage
5. `App.tsx` receives auth callback and sets user state
6. Stories are fetched with authenticated requests

### Story Management Flow
1. `App.tsx` fetches stories from API on mount
2. Stories displayed in `StoryCard` components within grid
3. User can:
   - **View**: Click on story to see full content
   - **Create**: Click "New Story" → `StoryForm` opens
   - **Edit**: Click edit icon → `StoryForm` populates with story data
   - **Delete**: Click delete icon with confirmation

### Character Management Flow
1. In `StoryForm`, user can add multiple characters
2. Each character has: name, role, description
3. Characters stored as array in story data
4. Characters displayed in `StoryCard` with visual styling

## 📦 Interface Definitions

### Core Interfaces
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
```

## 🎨 Styling

### Tailwind CSS Setup
- **Config**: `tailwind.config.ts`
- **PostCSS**: `postcss.config.js`
- **Global Styles**: `src/index.css`

### Color Scheme
- **Primary**: Purple (`#9333ea`, `#7e22ce`)
- **Accent**: Blue
- **Text**: Gray shades
- **Status**: Red (danger), Green (success)

### Responsive Design
- Mobile-first approach
- Grid layouts: `md:grid-cols-2 lg:grid-cols-3`
- Flexbox for navigation and component layouts

## 🔌 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### Stories
- `GET /stories` - Get all stories
- `GET /stories/my-stories` - Get user's stories
- `POST /stories` - Create new story
- `PUT /stories/{id}` - Update story
- `DELETE /stories/{id}` - Delete story

## 📝 Component Mapping from Original Code

| Original | Mapped To |
|----------|-----------|
| Auth form | `Auth.tsx` |
| Header | `Header.tsx` |
| Story creation form | `StoryForm.tsx` |
| Story display card | `StoryCard.tsx` |
| View toggle buttons | `StoryViewToggle.tsx` |
| Empty state | `EmptyState.tsx` |
| Loading spinner | `Loader.tsx` |
| Main logic | `App.tsx` |

## 🚀 Getting Started

### Installation
```bash
npm install
npm install lucide-react tailwindcss postcss autoprefixer
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

## 🔐 Storage
- **Token**: Stored in `localStorage` as `token`
- **Username**: Stored in `localStorage` as `username`
- **Clearing**: Done on logout, removing user session

## 🐛 Error Handling
- Try-catch blocks in API calls
- User-friendly error messages displayed in alert bars
- Loading states prevent multiple submissions
- Confirmation dialogs for destructive actions

## ✨ Key Features
- ✅ User authentication (Login/Register)
- ✅ Create stories with character details
- ✅ Edit existing stories
- ✅ Delete stories with confirmation
- ✅ View all stories or just user's stories
- ✅ Character management within stories
- ✅ Responsive design
- ✅ Real-time form validation
- ✅ Loading states and error handling
