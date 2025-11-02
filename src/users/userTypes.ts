export type userRowType = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
};

export type userType = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
};

export type createUserInsertType = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type createUserBodyType = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type loginUserBodyType = {
  email: string;
  password: string;
};

export type loginUserResponseType = {
  token: string;
  user: userType;
};
