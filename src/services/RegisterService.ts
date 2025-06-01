import { RegisterRequest, RegisterResponse } from "../types/auth";
import HttpService from "./HttpService";
import { API_CONFIG } from "../config";

class RegisterService {
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    try {
      const registerData = await HttpService.post<RegisterResponse>(
        "/user/register",
        data
      );

      // Extract access token from response
      const success = registerData.data.success;
      if (!success) {
        throw new Error("No access token received from server");
      }

      return registerData;
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("An unexpected error occurred");
    }
  }
}

export default new RegisterService();
