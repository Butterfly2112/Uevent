export interface JwtType {
  id: number;
  login: string;
  username: string;
  email: string;
  role: string;
  iat: Date;
  exp: Date;
}
