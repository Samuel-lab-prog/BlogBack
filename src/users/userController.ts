import { AppError } from '../utils/AppError';
import {
  createUser,
  findUserByEmail,
  validatePassword,
} from './userModel';
import { generateToken } from '../utils/jwt';
import {
  type userType,
  type createUserBodyType,
} from '../utils/types';

export async function registerUser(
  body: createUserBodyType
): Promise<userType> {
  if (
    !body.firstName ||
    !body.lastName ||
    !body.email ||
    !body.password
  ) {
    throw new AppError({
      statusCode: 400,
      messages: ['All fields are required'],
    });
  }
  const user = await createUser(body);
  return user;
}

export async function loginUser(body: {
  email: string;
  password: string;
}) {
  const { email, password } = body;
  const user = await findUserByEmail(email);
  if (!user)
    throw new AppError({
      statusCode: 401,
      messages: ['Invalid credentials'],
    });

  const valid = await validatePassword(user, password);
  if (!valid)
    throw new AppError({
      statusCode: 401,
      messages: ['Invalid credentials'],
    });

  const token = generateToken({ id: user.id, email: user.email });
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
    },
  };
}
