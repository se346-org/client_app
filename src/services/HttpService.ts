import axios, { AxiosError, AxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";
import { TOKEN_KEY } from "./LoginService";

const BASE_URL = "http://localhost:8080";

class HttpService {
  private static instance: HttpService;
  private token: string | null = null;

  private constructor() {
    this.setupAxiosInterceptors();
  }

  public static getInstance(): HttpService {
    if (!HttpService.instance) {
      HttpService.instance = new HttpService();
    }
    return HttpService.instance;
  }

  private setupAxiosInterceptors() {
    axios.interceptors.request.use(
      async (config) => {
        if (!this.token) {
          this.token = await SecureStore.getItemAsync(TOKEN_KEY);
        }
        if (this.token) {
          config.headers = new axios.AxiosHeaders({
            ...config.headers,
            Authorization: `Bearer ${this.token}`,
          });
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    axios.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle token expiration
          await this.handleTokenExpiration();
        }
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private async handleTokenExpiration() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    this.token = null;
    // You might want to navigate to login screen here
    // or use a navigation service to handle this
  }

  private handleError(error: AxiosError): Error {
    if (!error.response) {
      // Network error
      return new Error(
        "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn."
      );
    }

    const status = error.response.status;
    const data = error.response.data as any;

    switch (status) {
      case 400:
        return new Error(data.message || "Yêu cầu không hợp lệ");
      case 401:
        return new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      case 403:
        return new Error("Bạn không có quyền thực hiện hành động này");
      case 404:
        return new Error("Không tìm thấy tài nguyên");
      case 500:
        return new Error("Lỗi máy chủ. Vui lòng thử lại sau");
      default:
        return new Error(data.message || "Đã xảy ra lỗi");
    }
  }

  async get<T>(
    url: string,
    params?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await axios.get<T>(`${BASE_URL}${url}`, {
        ...config,
        params,
      });
      console.log("response", response);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await axios.post<T>(`${BASE_URL}${url}`, data, config);

      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await axios.put<T>(`${BASE_URL}${url}`, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await axios.delete<T>(`${BASE_URL}${url}`, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }
}

export default HttpService.getInstance();
