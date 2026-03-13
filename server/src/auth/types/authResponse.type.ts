import { UserResponse } from 'src/users/types/userResponse.type';

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: UserResponse;
}
