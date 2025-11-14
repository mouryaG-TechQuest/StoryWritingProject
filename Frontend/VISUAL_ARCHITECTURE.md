# Visual Component Architecture

## 🎯 Component Hierarchy Tree

```
App (Root)
│
├── [NOT LOGGED IN]
│   └── AuthPage
│       ├── Login Form
│       │   ├── Username Input
│       │   ├── Password Input
│       │   └── Submit Button
│       │
│       └── Register Form
│           ├── Username Input
│           ├── Email Input
│           ├── Password Input
│           └── Submit Button
│
└── [LOGGED IN]
    │
    ├── Header
    │   ├── Logo & Title
    │   ├── User Info Display
    │   └── Logout Button
    │
    ├── StoryViewToggle
    │   ├── All Stories Tab
    │   ├── My Stories Tab
    │   └── New Story Button
    │
    ├── [IF showForm === true]
    │   └── StoryForm
    │       ├── Title Input
    │       ├── Content Textarea
    │       │
    │       └── Characters Section
    │           ├── Character 1
    │           │   ├── Name Input
    │           │   ├── Role Input
    │           │   ├── Description Textarea
    │           │   └── Remove Button
    │           │
    │           ├── Character 2
    │           │   └── [Same fields as 1]
    │           │
    │           ├── Character N
    │           │   └── [Same fields as 1]
    │           │
    │           └── Add Character Button
    │
    ├── [IF loading && !showForm]
    │   └── LoadingSpinner (Animated)
    │
    ├── [IF displayStories.length > 0]
    │   └── Story Grid (3-column responsive)
    │       ├── StoryCard 1
    │       │   ├── Title
    │       │   ├── Author
    │       │   ├── Content Preview
    │       │   ├── Characters List
    │       │   │   ├── Character Name
    │       │   │   ├── Character Role (badge)
    │       │   │   └── Character Description
    │       │   ├── Created Date
    │       │   └── [IF isOwner]
    │       │       ├── Edit Button
    │       │       └── Delete Button
    │       │
    │       ├── StoryCard 2
    │       │   └── [Same as StoryCard 1]
    │       │
    │       └── StoryCard N
    │           └── [Same as StoryCard 1]
    │
    └── [IF displayStories.length === 0]
        └── EmptyState
            ├── Empty Icon
            ├── Contextual Message
            └── Call-to-action Text
```

## 🔄 State Management Flow

```
App.tsx State:
│
├── User State
│   ├── username: string
│   └── token: string
│
├── Story Data
│   ├── stories: Story[]
│   ├── myStories: Story[]
│   └── view: 'all' | 'my'
│
├── UI State
│   ├── showForm: boolean
│   ├── loading: boolean
│   └── error: string
│
├── Editing State
│   └── editingStory: Story | null
│
└── Form Data
    ├── title: string
    ├── content: string
    └── characters: Character[]

                    │
                    ▼
        ┌─────────────────────────┐
        │   App Event Handlers    │
        ├─────────────────────────┤
        │ • handleAuth()          │
        │ • fetchStories()        │
        │ • handleSubmitStory()   │
        │ • handleDeleteStory()   │
        │ • handleEditStory()     │
        │ • logout()              │
        └─────────────────────────┘
                    │
                    ▼
        ┌─────────────────────────┐
        │  Child Components       │
        ├─────────────────────────┤
        │ • Auth                  │
        │ • Header                │
        │ • StoryViewToggle       │
        │ • StoryForm             │
        │ • StoryCard (×N)        │
        │ • EmptyState            │
        │ • Loader                │
        └─────────────────────────┘
```

## 📡 API Communication Flow

```
┌─────────────────┐
│   App.tsx       │
│  (Logic Layer)  │
└────────┬────────┘
         │
    ┌────┴──────────────────────┬─────────────┐
    │                           │             │
    ▼                           ▼             ▼
┌──────────────┐    ┌──────────────────┐  ┌─────────┐
│   Auth API   │    │  Stories API     │  │ Storage │
│              │    │                  │  │         │
│ /auth/login  │    │ /stories         │  │ localStorage
│ /auth/register   │ /stories/my-stories   │ (token)
└──────────────┘    │ POST /stories    │  │ (username)
     │              │ PUT /stories/{id}│  └─────────┘
     │              │ DELETE /stories/{id}
     │              └──────────────────┘
     │                    │
     └────────┬───────────┘
              │
              ▼
     Backend API Server
     (http://localhost:8080)
```

## 🎨 Component Data Flow Diagram

```
AuthPage Input
    │
    ├── Form Submission
    │   └── handleAuth()
    │       ├── API Call to /auth/login or /auth/register
    │       ├── Receive token & username
    │       ├── Save to localStorage
    │       └── Call onAuth({username, token})
    │
    └── Callback to App
        ├── setUser({username, token})
        └── Trigger fetchStories()

StoryForm Input
    │
    ├── Title & Content Change
    │   └── Update formData state
    │
    ├── Character Management
    │   ├── Add Character → Push to characters array
    │   ├── Remove Character → Filter from characters array
    │   └── Update Character → Modify character object
    │
    └── Form Submission
        ├── handleSubmitStory()
        ├── API Call (POST /stories or PUT /stories/{id})
        ├── Receive updated story
        ├── Call fetchStories() to refresh
        └── Reset form state

StoryCard Display
    │
    ├── Receives story prop
    ├── Determines if current user is owner
    ├── Renders edit/delete buttons if owner
    │
    └── Actions:
        ├── Edit → Call onEdit() → Show form with data
        └── Delete → Confirm → Call onDelete() → Refresh
```

## 🔐 Authentication Flow

```
User Visit App
    │
    ▼
Check localStorage for token
    │
    ├── Token Exists
    │   │
    │   ├── Load user from localStorage
    │   ├── Show Main App
    │   └── Fetch stories with token
    │
    └── No Token
        │
        ├── Show Auth Page
        │
        ├── User enters credentials
        │
        ├── POST /auth/login or /auth/register
        │
        ├── Backend validates
        │
        ├── Returns token + username
        │
        ├── Save to localStorage
        │   ├── localStorage['token'] = token
        │   └── localStorage['username'] = username
        │
        ├── Update App state
        │
        ├── Show Main App
        │
        └── Fetch stories with token
```

## 📊 Responsive Layout Breakpoints

```
Mobile (< 768px)
┌─────────────────────┐
│      Header         │
├─────────────────────┤
│   View Toggle       │
│  (Stacked buttons)  │
├─────────────────────┤
│    Story Form       │
│  (if visible)       │
├─────────────────────┤
│  Story Cards Grid   │
│  (1 column)         │
│ ┌─────────────────┐ │
│ │    Story 1      │ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │    Story 2      │ │
│ └─────────────────┘ │
└─────────────────────┘

Tablet (768px - 1024px)
┌──────────────────────────────┐
│         Header               │
├──────────────────────────────┤
│  View Toggle | New Story     │
├──────────────────────────────┤
│    Story Form (if visible)   │
├──────────────────────────────┤
│ Story Cards Grid (2 columns) │
│ ┌──────────────┬──────────┐ │
│ │   Story 1    │ Story 2  │ │
│ ├──────────────┼──────────┤ │
│ │   Story 3    │ Story 4  │ │
│ └──────────────┴──────────┘ │
└──────────────────────────────┘

Desktop (> 1024px)
┌──────────────────────────────────┐
│            Header                │
├──────────────────────────────────┤
│ View Toggle        | New Story Btn│
├──────────────────────────────────┤
│     Story Form (if visible)      │
├──────────────────────────────────┤
│ Story Cards Grid (3 columns)     │
│ ┌─────────┬─────────┬──────────┐ │
│ │Story 1  │ Story 2 │ Story 3  │ │
│ ├─────────┼─────────┼──────────┤ │
│ │Story 4  │ Story 5 │ Story 6  │ │
│ ├─────────┼─────────┼──────────┤ │
│ │Story 7  │ Story 8 │ Story 9  │ │
│ └─────────┴─────────┴──────────┘ │
└──────────────────────────────────┘
```

## 🎨 Color Flow by Component

```
Header
├── Background: white
├── Text: gray-800
├── Accent: purple-600
└── Hover: red-700 (logout)

Auth Page
├── Background: gradient (purple to blue)
├── Card: white
├── Button: purple-600 → purple-700 hover
└── Error: red-50 border red-200

Main App
├── Background: gradient (purple-50 to blue-50)
├── Cards: white with shadow
├── Buttons: purple-600
│   ├── Active: purple-600 with white text
│   ├── Inactive: white with gray text
│   └── Hover: darker purple
│
├── Story Cards
│   ├── Background: white
│   ├── Characters: purple-50 background
│   ├── Role Badges: purple-200 background
│   └── Icons:
│       ├── Edit: blue
│       └── Delete: red
│
├── Form
│   ├── Inputs: white with gray border
│   ├── Focus: purple ring
│   └── Labels: gray-700
│
└── Empty State
    ├── Icon: gray-400
    ├── Text: gray-600
    └── Subtext: gray-500
```

## 🔌 Props Flow Diagram

```
App.tsx (Props Source)
│
├── → Header
│   ├── user { username, token }
│   └── onLogout: () => void
│
├── → AuthPage
│   └── onAuth: (user) => void
│
├── → StoryViewToggle
│   ├── view: 'all' | 'my'
│   ├── onViewChange: (view) => void
│   ├── allStoriesCount: number
│   ├── myStoriesCount: number
│   ├── onNewStory: () => void
│   └── showForm: boolean
│
├── → StoryForm (when showForm === true)
│   ├── formData: FormData
│   ├── setFormData: (data) => void
│   ├── onSubmit: (e) => Promise<void>
│   ├── onCancel: () => void
│   ├── loading: boolean
│   └── isEditing: boolean
│
├── → StoryCard (×N in map loop)
│   ├── story: Story
│   ├── isOwner: boolean
│   ├── onEdit: () => void
│   └── onDelete: () => void
│
├── → EmptyState
│   └── view: 'all' | 'my'
│
└── → LoadingSpinner
    ├── isLoading: boolean
    └── size: 'small' | 'medium' | 'large'
```

## 📈 State Update Timeline

```
User Action                 State Change            UI Update

Login submitted    →    user = {username, token}  →  Show Main App
                  →    token saved to localStorage
                  →    fetchStories()
                                              →    Stories loaded
                                              →    StoryCard rendered

Click New Story    →    showForm = true         →   StoryForm visible

Fill Form         →    formData updated         →   Form filled

Submit Story      →    loading = true           →   Submit disabled
                  →    API call                 →   Spinner shows
                  →    loading = false          →   Form submits
                  →    stories refreshed        →   Grid updates
                  →    showForm = false         →   Form hides

Switch to My      →    view = 'my'              →   Display changes
Stories                 displayStories updated   →   Grid refreshes

Click Delete      →    Confirm dialog           →   User confirms
                  →    loading = true           →   Button disabled
                  →    API call                 →   Spinner shows
                  →    stories refreshed        →   Story removed
                  →    loading = false          →   Grid updates

Click Logout      →    localStorage cleared    →   App reset
                  →    user = null             →   Show Auth page
                  →    stories = []
                  →    myStories = []
```

## 📱 Component Size Reference

```
Header
├── Height: 64px (p-4)
├── Max Width: 7xl (80rem)
└── Padding: 1rem (p-4)

StoryForm
├── Margin Bottom: 1.5rem
├── Padding: 1.5rem (p-6)
└── Max Content Width: 3xl

StoryCard
├── Min Height: Based on content
├── Padding: 1.5rem (p-6)
├── Shadow: lg (hover: xl)
└── Border Radius: lg (0.5rem)

StoryViewToggle
├── Margin Bottom: 1.5rem
├── Button Padding: 0.5rem 1rem (px-4 py-2)
└── Gap: 0.5rem (space-x-2)

Loader
├── Size: 48x48px (medium)
├── Border Width: 2px
└── Animation: spin 1s infinite
```

---

## 🎯 Summary

This visual architecture shows:
✅ Component hierarchy and nesting
✅ Data flow between components
✅ State management patterns
✅ API communication paths
✅ Responsive design breakpoints
✅ Color and styling system
✅ Props passing patterns
✅ User interaction flows

Use these diagrams to understand how the application works at a high level.

