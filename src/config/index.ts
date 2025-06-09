import { Platform } from "react-native";

// API Configuration
export const API_CONFIG = {
  BASE_URL:
    Platform.OS === "android"
      ? "http://10.0.2.2:8080"
      : "http://localhost:8080",
  TIMEOUT: 30000, // 30 seconds
  HEADERS: {
    "Content-Type": "application/json",
  },
} as const;

// Environment Configuration
export const ENV = {
  DEV: "development",
  PROD: "production",
  STAGING: "staging",
} as const;

// Current Environment
export const CURRENT_ENV = ENV.DEV;

// Feature Flags
export const FEATURES = {
  ENABLE_PUSH_NOTIFICATIONS: true,
  ENABLE_ANALYTICS: false,
} as const;

export const WS_CONFIG = {
  BASE_URL:
    Platform.OS === "android" ? "ws://10.0.2.2:8080" : "ws://localhost:8080",
} as const;
