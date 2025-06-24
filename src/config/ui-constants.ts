/**
 * UI-related constants for consistent styling and behavior
 */

// Table Configuration
export const TABLE_CONFIG = {
  DEFAULT_PAGE_SIZE: 50,
  MIN_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 500,
  VIRTUAL_SCROLL_HEIGHT: 400,
  LOADING_DELAY: 300, // ms
} as const;

// Component Sizes
export const COMPONENT_SIZES = {
  FORM_INPUT_MAX_LENGTH: 255,
  LOCALE_CODE_MAX_LENGTH: 2,
  TEXTAREA_MIN_ROWS: 3,
  TEXTAREA_MAX_ROWS: 10,
} as const;

// Layout Constants
export const LAYOUT = {
  HEADER_HEIGHT: 64,
  FOOTER_HEIGHT: 0,
  CONTENT_PADDING: 24,
  CARD_PADDING: 16,
  BUTTON_SPACING: 8,
} as const;

// Animation & Timing
export const ANIMATION = {
  TRANSITION_DURATION: 200, // ms
  DEBOUNCE_DELAY: 300, // ms
  NOTIFICATION_DURATION: 4000, // ms
  LOADING_MIN_DURATION: 500, // ms to prevent flashing
} as const;

// Form Validation
export const VALIDATION = {
  REQUIRED_FIELD_MESSAGE: 'This field is required',
  INVALID_URL_MESSAGE: 'Please enter a valid URL',
  INVALID_EMAIL_MESSAGE: 'Please enter a valid email address',
  MIN_PASSWORD_LENGTH: 8,
  MAX_TEXT_LENGTH: 1000,
} as const;

// File Upload
export const FILE_UPLOAD = {
  MAX_FILES: 10,
  ACCEPTED_IMAGE_TYPES: [
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp',
  ] as const,
  ACCEPTED_DOCUMENT_TYPES: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/json',
  ] as const,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR:
    'Network connection failed. Please check your internet connection.',
  AUTHENTICATION_ERROR: 'Authentication failed. Please check your credentials.',
  PERMISSION_ERROR: 'You do not have permission to perform this action.',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
  INVALID_FILE_FORMAT:
    'Invalid file format. Please select a supported file type.',
  GENERIC_ERROR: 'An unexpected error occurred. Please try again.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  SAVE_SUCCESS: 'Changes saved successfully!',
  DELETE_SUCCESS: 'Item deleted successfully!',
  IMPORT_SUCCESS: 'Import completed successfully!',
  EXPORT_SUCCESS: 'Export completed successfully!',
  TRANSLATION_SUCCESS: 'Translation completed successfully!',
} as const;

// Modal Configuration
export const MODAL_CONFIG = {
  DEFAULT_WIDTH: 520,
  LARGE_WIDTH: 800,
  SMALL_WIDTH: 416,
  CONFIRM_MODAL_WIDTH: 416,
} as const;

// Keyboard Shortcuts
export const KEYBOARD_SHORTCUTS = {
  SAVE: 'Ctrl+S',
  COPY: 'Ctrl+C',
  PASTE: 'Ctrl+V',
  UNDO: 'Ctrl+Z',
  REDO: 'Ctrl+Y',
  SEARCH: 'Ctrl+F',
} as const;
