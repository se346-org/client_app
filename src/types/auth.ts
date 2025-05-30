export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
}

export interface LoginResponse {
  data: {
    access_token: string;
  };
  message: string;
}

export interface RegisterRequest {
  email: string;
  full_name: string;
  password: string;
  avatar: string;
}

export interface RegisterResponse {
  data: {
    success: string;
    message: string;
  };
  message: string;
}
