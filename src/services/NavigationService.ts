import { createNavigationContainerRef } from "@react-navigation/native";
import { RootStackParamList } from "../types/navigation";

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export const NavigationService = {
  navigate(name: keyof RootStackParamList, params?: any) {
    if (navigationRef.isReady()) {
      navigationRef.navigate(name, params);
    }
  },
};
