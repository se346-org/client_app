import LoginService from "./LoginService";
import { API_CONFIG } from "../config";

class HttpService {
  private async getHeaders(): Promise<Headers> {
    const headers = new Headers(API_CONFIG.HEADERS);

    const token = await LoginService.getToken();
    if (token) {
      headers.append("Authorization", `Bearer ${token}`);
    }

    return headers;
  }

  async get<T>(endpoint: string): Promise<T> {
    const headers = await this.getHeaders();
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    console.log("GET Request:", url);

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      console.error("GET Error:", {
        status: response.status,
        statusText: response.statusText,
        url,
      });
      if (response.status === 401) {
        await LoginService.logout();
        throw new Error("Session expired");
      }
      const errorData = await response.json();
      throw new Error(errorData.message || "An error occurred");
    }

    return response.json();
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const headers = await this.getHeaders();

    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    console.log("POST Request:", {
      url,
      data,
      headers:
        endpoint === "/user/login" ? {} : Object.fromEntries(headers.entries()),
    });

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error("POST Error:", {
        status: response.status,
        statusText: response.statusText,
        url,
        data,
      });
      if (response.status === 401) {
        await LoginService.logout();
        throw new Error("Session expired");
      }
      const errorData = await response.json();
      throw new Error(errorData.message || "An error occurred");
    }

    const responseData = await response.json();
    console.log("POST Response:", responseData);
    return responseData;
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    const headers = await this.getHeaders();
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    console.log("PUT Request:", url);

    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error("PUT Error:", {
        status: response.status,
        statusText: response.statusText,
        url,
      });
      if (response.status === 401) {
        await LoginService.logout();
        throw new Error("Session expired");
      }
      const errorData = await response.json();
      throw new Error(errorData.message || "An error occurred");
    }

    return response.json();
  }

  async delete<T>(endpoint: string): Promise<T> {
    const headers = await this.getHeaders();
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    console.log("DELETE Request:", url);

    const response = await fetch(url, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      console.error("DELETE Error:", {
        status: response.status,
        statusText: response.statusText,
        url,
      });
      if (response.status === 401) {
        await LoginService.logout();
        throw new Error("Session expired");
      }
      const errorData = await response.json();
      throw new Error(errorData.message || "An error occurred");
    }

    return response.json();
  }
}

export default new HttpService();
