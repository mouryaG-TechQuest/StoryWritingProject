// Frontend Type Definitions

// ============================================
// Authentication & User Types
// ============================================

export interface User {
  id?: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  emailVerified?: boolean;
  createdAt?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
}

export interface RegisterResponse {
  token: string;
  username: string;
  message: string;
}

export interface ProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}

export interface UpdateProfileResponse {
  user: User;
}

export interface ResetPasswordRequest {
  email: string;
  resetCode: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotUsernameResponse {
  username: string;
  message: string;
}

// ============================================
// Story Types
// ============================================

export interface Genre {
  id: number;
  name: string;
  description?: string;
}

export interface Character {
  id?: string;
  name: string;
  description: string;
  role: string;
  actorName?: string;
  imageUrls?: string[];
  popularity?: number;
}

export interface TimelineEntry {
  id: string;
  event: string;
  description: string;
  characters: string[];
  imageUrls: string[];
  videoUrls?: string[];
  audioUrls?: string[];
  order: number;
}

export interface Story {
  id: string;
  title: string;
  content: string;
  description?: string;
  authorUsername: string;
  imageUrls?: string[];
  characters: Character[];
  createdAt: string;
  updatedAt?: string;
  isPublished?: boolean;
  likeCount?: number;
  viewCount?: number;
  commentCount?: number;
  isLikedByCurrentUser?: boolean;
  isFavoritedByCurrentUser?: boolean;
  genres?: Genre[];
  storyNumber?: string;
  totalWatchTime?: number;
  showSceneTimeline?: boolean;
  writers?: string;
  timelineJson?: string;
}

export interface StoryFormData {
  title: string;
  content: string;
  description: string;
  timelineJson: string;
  imageUrls: string[];
  characters: Character[];
  genreIds?: number[];
  isPublished?: boolean;
  writers?: string;
  showSceneTimeline?: boolean;
}

export interface CreateStoryRequest {
  title: string;
  description?: string;
  content?: string;
  timelineJson?: string;
  imageUrls?: string[];
  genreIds?: number[];
  isPublished?: boolean;
  writers?: string;
  showSceneTimeline?: boolean;
}

export interface UpdateStoryRequest extends CreateStoryRequest {
  id: string;
}

// ============================================
// Comment Types
// ============================================

export interface Comment {
  id: string;
  content: string;
  username: string;
  createdAt: string;
  storyId: string;
}

export interface CreateCommentRequest {
  content: string;
  storyId: string;
}

// ============================================
// API Response Types
// ============================================

export interface ApiError {
  message: string;
  status?: number;
  timestamp?: string;
  path?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// ============================================
// UI State Types
// ============================================

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  code?: string;
}

export type SortOption = 'newest' | 'oldest' | 'mostLiked' | 'mostViewed' | 'titleAZ' | 'titleZA' | 'authorAZ' | 'authorZA';

export type ViewType = 'grid' | 'list';

export type StoryFilter = {
  searchQuery?: string;
  sortBy?: SortOption;
  selectedGenres?: number[];
  authorUsername?: string;
};

// ============================================
// Form Types
// ============================================

export interface FormErrors {
  [key: string]: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FormErrors;
}

// ============================================
// Navigation Types
// ============================================

export type NavigationPage = 'home' | 'profile' | 'favorites' | 'create';

// ============================================
// Media Types
// ============================================

export interface MediaUploadResponse {
  urls: string[];
}

export type MediaType = 'image' | 'video' | 'audio';

// ============================================
// Auth Context Types
// ============================================

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

// ============================================
// HTTP Client Types
// ============================================

export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

export interface HttpResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

// ============================================
// Utility Types
// ============================================

export type Optional<T> = T | null | undefined;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ============================================
// Constants
// ============================================

export const API_BASE_URL = '/api';

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'mostLiked', label: 'Most Liked' },
  { value: 'mostViewed', label: 'Most Viewed' },
  { value: 'titleAZ', label: 'Title (A-Z)' },
  { value: 'titleZA', label: 'Title (Z-A)' },
  { value: 'authorAZ', label: 'Author (A-Z)' },
  { value: 'authorZA', label: 'Author (Z-A)' },
];
