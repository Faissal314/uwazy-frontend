export type Role = 'FORMATEUR' | 'ETUDIANT' | 'ADMINISTRATEUR';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  role: Role;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export type CourseStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'PENDING_VALIDATION';

export interface Course {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  category?: Category;
  instructor?: User;
  status: CourseStatus;
  modules?: Module[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Module {
  id: number;
  title: string;
  description: string;
  orderIndex: number;
  lessons?: Lesson[];
  quizzes?: Quiz[];
}

export interface Lesson {
  id: number;
  title: string;
  content: string;
  videoUrl?: string;
  documentUrl?: string;
  orderIndex: number;
}

export interface Question {
  id: number;
  text: string;
  options?: string[]; // Assuming simple options or could be a complex relationship depending on backend
  correctOptionIndex?: number;
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  module?: Module;
  questions?: Question[];
}

export interface Attempt {
  id: number;
  student?: User;
  quiz?: Quiz;
  score: number;
  passed: boolean;
  attemptedAt: string;
}
