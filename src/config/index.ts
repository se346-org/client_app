// API Configuration
export const API_CONFIG = {
  BASE_URL: "http://localhost:8080",
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
