export interface UserItem {
  id: number;
  username: string;
  email: string;
  phone_number: string;
  full_name: string;
}

export interface Tokens {
  access_token: string;
  // refreshToken: string;
  token_type: string;
  // token_type: string | null;
}

export interface User {
  user_id: number;
  username: string;
  // permissions: Permission[] | null;
}
