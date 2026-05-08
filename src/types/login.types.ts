export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe: boolean;
}
