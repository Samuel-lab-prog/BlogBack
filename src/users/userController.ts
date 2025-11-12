import { AppError } from '../utils/AppError';
import { insertUser, selectIsAdmin, selectUserByEmail } from './userModel';
import { generateToken, verifyToken, type Payload } from '../utils/jwt';
import bcrypt from 'bcryptjs';
import { type User } from './userTypes';

export async function registerUser(
  body: Omit<User, 'id' | 'isAdmin'>
): Promise<boolean> {
  const passwordHash = await bcrypt.hash(body.password, Number(process.env.SALT_ROUNDS) || 10);
  return Boolean(await insertUser({ ...body, password: passwordHash }));
}

export async function loginUser(
  body: Pick<User, 'email' | 'password'>
): Promise<{ token: string; user: Pick<User, 'firstName' | 'lastName'> }> {
  const user = await selectUserByEmail(body.email);
  if (!user || !(await bcrypt.compare(body.password, user.password_hash))) {
    throw new AppError({
      statusCode: 401,
      errorMessages: ['Invalid credentials'],
    });
  }
  const token = generateToken({ id: user.id, email: user.email } as Payload);
  return {
    token,
    user: {
      firstName: user.first_name,
      lastName: user.last_name,
    },
  };
}

export async function authenticateUser(token: string): Promise<Pick<User, 'isAdmin' | 'id'>> {
  const payload = verifyToken(token);
  if (!payload) {
    throw new AppError({
      statusCode: 404,
      errorMessages: ['User not found'],
    });
  }
  return {
    id: payload.id,
    isAdmin: await selectIsAdmin(payload.id),
  };
}
