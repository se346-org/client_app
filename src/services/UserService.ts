import HttpService from "./HttpService";
import { UserInfo, UserInfoResponse } from "../types/user";

class UserService {
  async getUserInfo(): Promise<UserInfoResponse> {
    try {
      return await HttpService.get<UserInfoResponse>("/auth/user/info");
    } catch (error) {
      console.error("Error getting user info:", error);
      throw error;
    }
  }
}

export default new UserService();
