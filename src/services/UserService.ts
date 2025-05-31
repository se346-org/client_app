import HttpService from "./HttpService";
import { UserInfoResponse, UserSearchResponse } from "../types/user";

class UserService {
  async getUserInfo(): Promise<UserInfoResponse> {
    try {
      return await HttpService.get<UserInfoResponse>("/auth/user/info");
    } catch (error) {
      console.error("Error getting user info:", error);
      throw error;
    }
  }

  async searchUsers(keyword: string): Promise<UserSearchResponse> {
    try {
      return await HttpService.get<UserSearchResponse>(
        `/auth/user/search?keyword=${encodeURIComponent(keyword)}`
      );
    } catch (error) {
      console.error("Error searching users:", error);
      throw error;
    }
  }
}

export default new UserService();
