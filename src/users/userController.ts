import { AppError } from '../utils/AppError';
import { insertUser, selectIsAdmin, selectUserByEmail, selectUserById } from './userModel';
import { generateToken, verifyToken, type Payload } from '../utils/jwt';
import { type User } from './userTypes';
import bycrypt from 'bcryptjs';

export async function registerUser(body: Omit<User, 'id' | 'isAdmin'>): Promise<Pick<User, 'id'>> {
  const passwordHash = await bycrypt.hash(
    body.password,
    process.env.SALT_ROUNDS ? parseInt(process.env.SALT_ROUNDS) : 10
  );
  return await insertUser({ ...body, password: passwordHash });
}

export async function loginUser(
  body: Pick<User, 'email' | 'password'>
): Promise<{ token: string; user: Omit<User, 'password'> }> {
  const user = await selectUserByEmail(body.email);
  if (!user || !(await bycrypt.compare(body.password, user.password))) {
    throw new AppError({
      statusCode: 401,
      errorMessages: ['Invalid credentials'],
    });
  }
  const token = generateToken({ id: user.id, email: user.email } as Payload);
  return {
    token,
    user: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      id: user.id,
      isAdmin: user.isAdmin,
    },
  };
}

export async function authenticateUser(token: string): Promise<Omit<User, 'password'>> {
  const payload = verifyToken(token);
  if (!payload) {
    throw new AppError({
      statusCode: 404,
      errorMessages: ['User not found'],
    });
  }
  const user = await selectUserById(payload.id);
  if (!user) {
    throw new AppError({
      statusCode: 404,
      errorMessages: ['User not found'],
    });
  }
const { password, ...userWithoutPassword } = user;
return userWithoutPassword;
}
