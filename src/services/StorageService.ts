import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserInfo } from "../types/user";

const STORAGE_KEYS = {
  USER_INFO: "@user_info",
  AUTH_TOKEN: "@auth_token",
};

class StorageService {
  async setUserInfo(userInfo: UserInfo): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_INFO,
        JSON.stringify(userInfo)
      );
    } catch (error) {
      console.error("Error saving user info:", error);
      throw error;
    }
  }

  async getUserInfo(): Promise<UserInfo | null> {
    try {
      const userInfo = await AsyncStorage.getItem(STORAGE_KEYS.USER_INFO);
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.error("Error getting user info:", error);
      return null;
    }
  }

  async setAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error("Error saving auth token:", error);
      throw error;
    }
  }

  async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  }

  async clearStorage(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_INFO,
        STORAGE_KEYS.AUTH_TOKEN,
      ]);
    } catch (error) {
      console.error("Error clearing storage:", error);
      throw error;
    }
  }
}

export default new StorageService();
