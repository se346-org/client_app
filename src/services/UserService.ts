import HttpService from "./HttpService";
import {
  UpdateUserInfoRequest,
  UploadAvatarResponse,
  UserInfo,
  UserInfoResponse,
  UserSearchResponse,
} from "../types/user";

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

  async uploadAvatar(formData: FormData): Promise<UploadAvatarResponse> {
    try {
      console.log("formData", formData);
      return await HttpService.post<UploadAvatarResponse>(
        "/auth/upload",
        formData
      );
    } catch (error) {
      console.error("Error uploading avatar:", error);
      throw error;
    }
  }

  async updateUserInfo(
    userInfo: UpdateUserInfoRequest
  ): Promise<UserInfoResponse> {
    try {
      return await HttpService.patch<UserInfoResponse>("/auth/user", userInfo);
    } catch (error) {
      console.error("Error updating user info:", error);
      throw error;
    }
  }
}

export default new UserService();
