import { AppError } from '../utils/AppError';
import { insertUser, selectIsAdmin, selectUserByEmail } from './userModel';
import { generateToken, verifyToken, type Payload } from '../utils/jwt';
import bcrypt from 'bcryptjs';
import { type User } from './userTypes';

export async function registerUser(
  body: Omit<User, 'id' | 'isAdmin'>
): Promise<Omit<User, 'password'>> {
  const { password } = body;
  const password_hash = await bcrypt.hash(password, Number(process.env.SALT_ROUNDS) || 10);
  body.password = password_hash;
  return insertUser(body);
}

export async function loginUser(
  body: Pick<User, 'email' | 'password'>
): Promise<{ token: string; user: Pick<User, 'firstName' | 'lastName'> }> {
  const { email, password } = body;
  const user = await selectUserByEmail(email);
  if (!user) {
    throw new AppError({
      statusCode: 401,
      errorMessages: ['Invalid credentials'],
    });
  }
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
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

export async function authenticateUser(token: string): Promise<boolean> {
  const user = verifyToken(token);
  if (!user) {
    throw new AppError({
      statusCode: 404,
      errorMessages: ['User not found'],
    });
  }
  return await selectIsAdmin(user.id);
}
