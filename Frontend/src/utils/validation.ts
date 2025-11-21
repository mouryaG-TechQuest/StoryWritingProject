/**
 * Validation Utilities
 * Provides reusable validation functions for forms
 */

import type { FormErrors, ValidationResult } from '../types';

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * Must be 8+ characters with uppercase, lowercase, number, and special character
 */
export function isValidPassword(password: string): boolean {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

/**
 * Validate username format
 * 3-20 characters, alphanumeric and underscores only
 */
export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
}

/**
 * Validate phone number format
 * Supports various formats with optional country code
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if string is empty or only whitespace
 */
export function isEmpty(value: string): boolean {
  return value.trim().length === 0;
}

/**
 * Validate field length
 */
export function isValidLength(value: string, min: number, max: number): boolean {
  const length = value.trim().length;
  return length >= min && length <= max;
}

/**
 * Validate numeric value
 */
export function isValidNumber(value: string, min?: number, max?: number): boolean {
  const num = Number(value);
  
  if (isNaN(num)) {
    return false;
  }

  if (min !== undefined && num < min) {
    return false;
  }

  if (max !== undefined && num > max) {
    return false;
  }

  return true;
}

/**
 * Validate login form
 */
export function validateLoginForm(username: string, password: string): ValidationResult {
  const errors: FormErrors = {};

  if (isEmpty(username)) {
    errors.username = 'Username is required';
  }

  if (isEmpty(password)) {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate registration form
 */
export function validateRegistrationForm(data: {
  username: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
}): ValidationResult {
  const errors: FormErrors = {};

  // Username
  if (isEmpty(data.username)) {
    errors.username = 'Username is required';
  } else if (!isValidUsername(data.username)) {
    errors.username = 'Username must be 3-20 characters, alphanumeric and underscores only';
  }

  // Password
  if (isEmpty(data.password)) {
    errors.password = 'Password is required';
  } else if (!isValidPassword(data.password)) {
    errors.password = 'Password must be 8+ characters with uppercase, lowercase, number, and special character';
  }

  // Confirm Password
  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  // First Name
  if (isEmpty(data.firstName)) {
    errors.firstName = 'First name is required';
  } else if (!isValidLength(data.firstName, 2, 50)) {
    errors.firstName = 'First name must be 2-50 characters';
  }

  // Last Name
  if (isEmpty(data.lastName)) {
    errors.lastName = 'Last name is required';
  } else if (!isValidLength(data.lastName, 2, 50)) {
    errors.lastName = 'Last name must be 2-50 characters';
  }

  // Email
  if (isEmpty(data.email)) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Invalid email format';
  }

  // Phone Number (optional)
  if (data.phoneNumber && !isEmpty(data.phoneNumber) && !isValidPhoneNumber(data.phoneNumber)) {
    errors.phoneNumber = 'Invalid phone number format';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate story form
 */
export function validateStoryForm(data: {
  title: string;
  description?: string;
  genreIds?: number[];
}): ValidationResult {
  const errors: FormErrors = {};

  // Title
  if (isEmpty(data.title)) {
    errors.title = 'Title is required';
  } else if (!isValidLength(data.title, 3, 200)) {
    errors.title = 'Title must be 3-200 characters';
  }

  // Description (optional)
  if (data.description && !isValidLength(data.description, 0, 1000)) {
    errors.description = 'Description must not exceed 1000 characters';
  }

  // Genres
  if (!data.genreIds || data.genreIds.length === 0) {
    errors.genres = 'Please select at least one genre';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate character form
 */
export function validateCharacterForm(data: {
  name: string;
  description?: string;
  role?: string;
}): ValidationResult {
  const errors: FormErrors = {};

  // Name
  if (isEmpty(data.name)) {
    errors.name = 'Character name is required';
  } else if (!isValidLength(data.name, 2, 100)) {
    errors.name = 'Character name must be 2-100 characters';
  }

  // Description (optional)
  if (data.description && !isValidLength(data.description, 0, 500)) {
    errors.description = 'Description must not exceed 500 characters';
  }

  // Role (optional)
  if (data.role && !isValidLength(data.role, 0, 50)) {
    errors.role = 'Role must not exceed 50 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate comment form
 */
export function validateCommentForm(content: string): ValidationResult {
  const errors: FormErrors = {};

  if (isEmpty(content)) {
    errors.content = 'Comment cannot be empty';
  } else if (!isValidLength(content, 1, 500)) {
    errors.content = 'Comment must be 1-500 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Sanitize HTML to prevent XSS attacks
 */
export function sanitizeHtml(html: string): string {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Validate file size
 */
export function isValidFileSize(file: File, maxSizeMB: number): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Validate file type
 */
export function isValidFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): ValidationResult {
  const errors: FormErrors = {};

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSizeMB = 10;

  if (!isValidFileType(file, allowedTypes)) {
    errors.fileType = 'Only JPEG, PNG, GIF, and WebP images are allowed';
  }

  if (!isValidFileSize(file, maxSizeMB)) {
    errors.fileSize = `File size must not exceed ${maxSizeMB}MB`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
