import { LoginRequest, LoginResponse } from "../types/auth";
import * as SecureStore from "expo-secure-store";
import HttpService from "./HttpService";
import { API_CONFIG } from "../config";

export const TOKEN_KEY = "auth_token";

class LoginService {
  async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      console.log("Attempting login with:", { email: data.email });
      console.log("API URL:", `${API_CONFIG.BASE_URL}/auth/login`);

      const loginData = await HttpService.post<LoginResponse>(
        "/user/login",
        data
      );
      console.log("Login successful:", loginData);

      // Extract access token from response
      const accessToken = loginData.data.access_token;
      if (!accessToken) {
        throw new Error("No access token received from server");
      }

      // Save token to SecureStore
      await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
      console.log("Token saved to SecureStore");

      return loginData;
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("An unexpected error occurred");
    }
  }

  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error("Error getting token from SecureStore:", error);
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      console.log("Token removed from SecureStore");
    } catch (error) {
      console.error("Error removing token from SecureStore:", error);
    }
  }
}

export default new LoginService();
