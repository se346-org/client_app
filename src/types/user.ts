export interface UserInfo {
  user_id: string;
  username: string;
  email: string;
  avatar?: string;
  user_online_id: string;
  full_name: string;
}

export interface UserInfoResponse {
  data: UserInfo;
  message: string;
  status: number;
}

export interface UserSearchResponse {
  data: UserInfo[];
  message: string;
  status: number;
}

export interface UserSearch {
  full_name: string;
  avatar: string;
  user_id: string;
}
