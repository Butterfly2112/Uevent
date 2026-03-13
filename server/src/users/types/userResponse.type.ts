export interface UserResponse {
  id: number;
  login: string;
  username: string;
  email: string;
  emailValidated: boolean;
  avatar_url: string;
  role: string;
  created_at: Date;
}
