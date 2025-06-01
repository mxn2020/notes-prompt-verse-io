// User types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  defaultNoteType: string;
  sidebarCollapsed: boolean;
  categoriesOrder: string[];
  pinnedNotes: string[];
}

// Note types
export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: string;
  fields: Record<string, any>;
  parentId?: string;
  threadId?: string;
  category?: string;
  tags: string[];
  color?: string;
  isPinned: boolean;
  isArchived: boolean;
  images?: NoteImage[];
  createdAt: string;
  updatedAt: string;
}

export interface NoteImage {
  id: string;
  url: string;
  publicId: string;
  caption?: string;
}

export interface NoteThread {
  id: string;
  rootNote: Note;
  subNotes: Note[];
}

// Note type template types
export interface NoteTypeField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'date' | 'number' | 'radio' | 'color' | 'image';
  placeholder?: string;
  required?: boolean;
  options?: string[]; // For select and radio
  defaultValue?: any;
  maxImages?: number; // For image type fields
}

export interface NoteType {
  id: string;
  userId: string;
  name: string;
  description: string;
  icon: string;
  fields: NoteTypeField[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

// Category type
export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Toast notification
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

// Auth related types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}