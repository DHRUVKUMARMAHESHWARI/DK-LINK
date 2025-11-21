
export enum Category {
  WORK = 'Work',
  PERSONAL = 'Personal',
  ENTERTAINMENT = 'Entertainment',
  FINANCE = 'Finance',
  EDUCATION = 'Education',
  SOCIAL = 'Social',
  OTHER = 'Other'
}

export interface LinkItem {
  id: string;
  userId: string;
  url: string;
  title: string;
  category: Category;
  tags: string[];
  clicks: number;
  createdAt: number;
}

export interface PasswordItem {
  id: string;
  userId: string;
  site: string;
  username: string;
  password: string; // Encrypted in API layer
  category: Category;
  strength: 'Weak' | 'Medium' | 'Strong';
  lastUpdated: number;
}

export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  date: string; // ISO string
  type: 'Meeting' | 'Birthday' | 'Deadline' | 'Reminder';
  completed: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export type View = 'dashboard' | 'links' | 'passwords' | 'calendar' | 'assistant';

export interface User {
  id: string;
  name: string;
  email: string;
  isAuthenticated: boolean;
}
