import api from './api';

export interface RegisterData {
  nickname: string;
  email?: string;
  phone?: string;
  password: string;
  password_confirmation: string;
}

export interface LoginData {
  login: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: number;
    nickname: string;
    email?: string;
    phone?: string;
  };
  access_token: string;
  token_type: string;
}

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/register', data);
    return response.data;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/login', data);
    return response.data;
  }
}; 