import { t } from 'elysia';
import { AppError } from '../utils/AppError';

export const registerUserBodySchema = t.Object({
  email: t.String({
    format: 'email',
    example: 'david@gmail.com',
    error(){
      throw new AppError({
        statusCode: 400,
        errorMessages: ['Email must be a valid email address'],
      });
    }
  }),
  password: t.String({
    minLength: 6,
    maxLength: 30,
    example: '12345678',
    error(){
      throw new AppError({
        statusCode: 400,
        errorMessages: ['Password must be between 6 and 30 characters long'],
      });
    }
  }),
  firstName: t.String({
    minLength: 3,
    maxLength: 30,
    example: 'David',
    error(){
      throw new AppError({
        statusCode: 400,
        errorMessages: ['First name must be between 3 and 30 characters long'],
      });
    }
  }),
  lastName: t.String({
    minLength: 3,
    maxLength: 30,
    example: 'Smith',
    error(){
      throw new AppError({
        statusCode: 400,
        errorMessages: ['Last name must be between 3 and 30 characters long'],
      });
    }
  }),
});

export const registerUserResponseSchema = t.Object({
  id: t.Number(),
  email: t.String(),
  firstName: t.String(),
  lastName: t.String(),
  isAdmin: t.Boolean(),
});

export const loginUserBodySchema = t.Object({
  email: t.String({
    format: 'email',
    example: 'david@gmail.com',
    error(){
      throw new AppError({
        statusCode: 400,
        errorMessages: ['Email must be a valid email address'],
      });
    }
  }),
  password: t.String({
    minLength: 6,
    maxLength: 30,
    example: '12345678',
    error(){
      throw new AppError({
        statusCode: 400,
        errorMessages: ['Password must be between 6 and 30 characters long'],
      });
    }
  }),
});

export const loginUserResponseSchema = t.Object({
  firstName: t.String(),
  lastName: t.String(),
  email: t.String(),
  id: t.Number(),
  isAdmin: t.Boolean(),
});
