export type UserRow = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  is_admin: boolean;
};

export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  isAdmin: boolean;
};

export type UserWithPasswordHash = User & {
  passwordHash: string;
};

export type NewUser = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};