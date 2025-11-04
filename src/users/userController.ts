import { AppError } from '../utils/AppError';
import { createUser, findUserByEmail, validatePassword, findUserById, isAdmin } from './userModel';
import { generateToken, verifyToken } from '../utils/jwt';
import { type User } from './userTypes';

export async function registerUser(
  body: Omit<User, 'id' | 'isAdmin'>
): Promise<Omit<User, 'password'>> {
  const { firstName, lastName, email, password } = body;
  if (!firstName || !lastName || !email || !password) {
    throw new AppError({
      statusCode: 400,
      errorMessages: ['Missing required user fields'],
    });
  }

  return createUser(body);
}

export async function loginUser(
  body: Pick<User, 'email' | 'password'>
): Promise<{ token: string; user: Omit<User, 'password'> }> {
  const { email, password } = body;

  if (!email || !password) {
    throw new AppError({
      statusCode: 400,
      errorMessages: ['Email and password are required'],
    });
  }

  const user = await findUserByEmail(email);
  if (!user) {
    throw new AppError({
      statusCode: 401,
      errorMessages: ['Invalid credentials'],
    });
  }

  const valid = await validatePassword(user, password);
  if (!valid) {
    throw new AppError({
      statusCode: 401,
      errorMessages: ['Invalid credentials'],
    });
  }

  const token = generateToken({ id: user.id, email: user.email });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      isAdmin: user.is_admin,
    },
  };
}

export async function authUser(token: string): Promise<boolean> {
  if (!token) {
    throw new AppError({ statusCode: 401, errorMessages: ['Token not provided'] });
  }

  const payload = verifyToken(token);
  if (!payload) {
    throw new AppError({ statusCode: 401, errorMessages: ['Invalid or expired token'] });
  }

  const user = await findUserById(payload.id);
  if (!user) {
    throw new AppError({ statusCode: 404, errorMessages: ['User not found'] });
  }

  return isAdmin(user.id);
}
