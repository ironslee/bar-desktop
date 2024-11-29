export interface UserItem {
  id: number;
  name: string;
  number: string;
}

export interface Tokens {
  token: string;
  refreshToken: string;
  tokenType: string | null;
}

export interface User {
  user_id: number;
  username: string;
  // permissions: Permission[] | null;
}
