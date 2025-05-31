export interface UserInfo {
  user_id: string;
  username: string;
  email: string;
  avatar?: string;
  user_online_id: string;
}

export interface UserInfoResponse {
  data: UserInfo;
  message: string;
  status: number;
}
