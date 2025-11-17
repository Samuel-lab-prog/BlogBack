import { AppError } from '../utils/AppError';
import { insertUser, selectUserByEmail, selectUserById } from './userModel';
import { generateToken, verifyToken, type Payload } from '../utils/jwt';
import { type NewUser, type User } from './userTypes';
import bcrypt from 'bcryptjs';

export async function registerUser(body: NewUser): Promise<Pick<User, 'id'>> {
  const passwordHash = await bcrypt.hash(
    body.password,
    process.env.SALT_ROUNDS ? parseInt(process.env.SALT_ROUNDS) : 10
  );
  return await insertUser({ ...body, password: passwordHash });
}

export async function loginUser(body: {
  email: string;
  password: string;
}): Promise<{ token: string; user: User }> {
  const user = await selectUserByEmail(body.email);
  if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) {
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

export async function authenticateUser(token: string): Promise<User> {
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
  return user;
}
