import { t } from 'elysia';
import { AppError } from '../utils/AppError';

export const registerUserBodySchema = t.Object({
  email: t.String({
    format: 'email',
    example: 'david@gmail.com',
    error() {
      throw new AppError({
        errorMessages: [
          'Invalid email format: email must be a valid email address',
        ],
        statusCode: 422,
      });
    },
  }),
  password: t.String({
    minLength: 6,
    maxLength: 20,
    example: '12345678',
    error() {
      throw new AppError({
        errorMessages: [
          'Invalid password format: password must be between 6 and 20 characters',
        ],
        statusCode: 422,
      });
    },
  }),
  firstName: t.String({
    minLength: 3,
    maxLength: 30,
    example: 'David',
    error() {
      throw new AppError({
        errorMessages: [
          'Invalid first name format: first name must be between 3 and 30 characters',
        ],
        statusCode: 422,
      });
    },
  }),
  lastName: t.String({
    minLength: 3,
    maxLength: 30,
    example: 'Smith',
    error() {
      throw new AppError({
        errorMessages: [
          'Invalid last name format: last name must be between 3 and 30 characters',
        ],
        statusCode: 422,
      });
    },
  }),
});

export const registerUserResponseSchema = t.Object({
  id: t.Number(),
  email: t.String(),
  firstName: t.String(),
  lastName: t.String(),
});

export const loginUserBodySchema = t.Object({
  email: t.String({
    format: 'email',
    example: 'david@gmail.com',
    error() {
      throw new AppError({
        errorMessages: [
          'Invalid email format: email must be a valid email address',
        ],
        statusCode: 422,
      });
    },
  }),
  password: t.String({
    example: '12345678',
    error() {
      throw new AppError({
        errorMessages: [
          'Invalid password format: password must be at least 6 characters long',
        ],
        statusCode: 422,
      });
    },
  }),
});

export const loginUserResponseSchema = t.Object({
  token: t.String({ example: 'jwt.token.here' }),
  user: t.Object({
    id: t.Number(),
    email: t.String(),
    firstName: t.String(),
    lastName: t.String(),
  }),
});
