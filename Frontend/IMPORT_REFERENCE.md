# Import Reference Guide

## Component Imports in App.tsx

```typescript
// Main dependencies
import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import './App.css';

// Page components
import AuthPage from './pages/Auth/Auth';

// Layout components
import Header from './components/layout/Header';

// Feature components
import StoryForm from './components/StoryForm';
import StoryCard from './components/StoryCard';
import StoryViewToggle from './components/StoryViewToggle';
import EmptyState from './components/EmptyState';

// Utility components
import LoadingSpinner from './components/common/Loader';
```

## Component Internal Imports

### Auth.tsx
```typescript
import { useState } from 'react';
import { AlertCircle, BookOpen } from 'lucide-react';
```

### Header.tsx
```typescript
import { BookOpen, User, LogOut } from 'lucide-react';
```

### StoryForm.tsx
```typescript
import { Plus, Trash2 } from 'lucide-react';
```

### StoryCard.tsx
```typescript
import { Edit, Trash2 } from 'lucide-react';
```

### StoryViewToggle.tsx
```typescript
import { Plus } from 'lucide-react';
```

### EmptyState.tsx
```typescript
import { BookOpen } from 'lucide-react';
```

### Loader.tsx
```typescript
// No external imports - uses Tailwind CSS
```

## Expected File Structure for Imports to Work

```
Frontend/
├── src/
│   ├── App.tsx ← Main file (imports below)
│   ├── index.css
│   ├── main.tsx
│   │
│   ├── pages/
│   │   └── Auth/
│   │       └── Auth.tsx ← imported as './pages/Auth/Auth'
│   │
│   ├── components/
│   │   ├── common/
│   │   │   └── Loader.tsx ← imported as './components/common/Loader'
│   │   ├── layout/
│   │   │   └── Header.tsx ← imported as './components/layout/Header'
│   │   ├── StoryForm.tsx ← imported as './components/StoryForm'
│   │   ├── StoryCard.tsx ← imported as './components/StoryCard'
│   │   ├── StoryViewToggle.tsx ← imported as './components/StoryViewToggle'
│   │   └── EmptyState.tsx ← imported as './components/EmptyState'
│   │
│   └── [other directories...]
│
├── tailwind.config.ts ← Required for Tailwind
├── postcss.config.js ← Required for Tailwind
├── vite.config.ts
├── tsconfig.json
├── package.json
└── index.html
```

## Import Statements by Component

### App.tsx (Root Component)
```typescript
// All imports from App.tsx
import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import './App.css';
import Header from './components/layout/Header';
import AuthPage from './pages/Auth/Auth';
import StoryForm from './components/StoryForm';
import StoryCard from './components/StoryCard';
import StoryViewToggle from './components/StoryViewToggle';
import EmptyState from './components/EmptyState';
import LoadingSpinner from './components/common/Loader';
```

### Auth.tsx
```typescript
import { useState } from 'react';
import { AlertCircle, BookOpen } from 'lucide-react';
```

### Header.tsx
```typescript
import { BookOpen, User, LogOut } from 'lucide-react';
```

### StoryForm.tsx
```typescript
import { Plus, Trash2 } from 'lucide-react';
```

### StoryCard.tsx
```typescript
import { Edit, Trash2 } from 'lucide-react';
```

### StoryViewToggle.tsx
```typescript
import { Plus } from 'lucide-react';
```

### EmptyState.tsx
```typescript
import { BookOpen } from 'lucide-react';
```

### Loader.tsx
```typescript
// No imports needed - pure React component with Tailwind styling
```

## Critical Import Notes

⚠️ **Important**: Make sure:

1. **File Extensions**: All components are `.tsx` (TypeScript)
2. **Relative Paths**: Use `./` for relative imports from `App.tsx`
3. **lucide-react**: Must be installed via `npm install lucide-react`
4. **Tailwind CSS**: Must be properly configured for styling to work
5. **API_BASE URL**: Check that `http://localhost:8080/api` is correct for your backend

## Troubleshooting Import Issues

### Issue: "Cannot find module"
```
Solution: Check the exact file path and ensure it exists
- Verify file is in correct directory
- Check file extension matches import (.tsx not .jsx)
- Use relative paths from where you're importing
```

### Issue: "Module not found: 'lucide-react'"
```
Solution: Install the package
npm install lucide-react
```

### Issue: "No matching export found"
```
Solution: Verify component has default export
// ✅ Correct
const Header = () => { ... };
export default Header;

// ❌ Incorrect
export const Header = () => { ... };
// Then imported as: import Header from './Header'
```

### Issue: TypeScript errors on imports
```
Solution: Ensure tsconfig.json is configured correctly
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react"
  }
}
```

## IDE Configuration

### VS Code Settings for Best Experience
```json
// .vscode/settings.json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

## Quick Verification

After creating all files, verify imports are working:

```bash
# Run the development server
npm run dev

# Check browser console for import errors
# You should see:
# ✅ App renders without errors
# ✅ No "Cannot find module" errors
# ✅ No "No matching export" errors
```

## Summary

All imports follow these patterns:

```
// From App.tsx:
import ComponentName from './path/to/Component';

// All relative paths start with './'
// All components export default
// All icon imports from 'lucide-react'
// All React hooks from 'react'
```

If you see import errors, verify:
1. File exists in the correct location
2. Component uses `.tsx` extension
3. Component has `export default ComponentName`
4. Path is relative and correct
5. Required npm packages are installed

