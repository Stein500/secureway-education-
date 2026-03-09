export interface Student {
  id: string;
  matricule: string;
  fullName: string;
  prenom: string;
  classe: string;
  parentName: string;
  moyenne?: number;
  mention?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  student: Student | null;
  token: string | null;
}

export interface CaptchaData {
  num1: number;
  num2: number;
  operator: '+' | '-' | '×';
  answer: number;
}

export interface LoginFormData {
  username: string;
  password: string;
  captchaAnswer: string;
  rememberMe: boolean;
}