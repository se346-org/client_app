export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  data: {
    access_token: string;
  };
  message: string;
}
