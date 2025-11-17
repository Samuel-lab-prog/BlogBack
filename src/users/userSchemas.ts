import { t } from 'elysia';
import { AppError } from '../utils/AppError';

export const emailField = t.String({
  format: 'email',
  example: 'david@gmail.com',
  error() {
    throw new AppError({
      statusCode: 400,
      errorMessages: ['Invalid email format'],
    });
  },
});

export const passwordField = t.String({
  minLength: 6,
  maxLength: 30,
  example: '12345678',
  error() {
    throw new AppError({
      statusCode: 400,
      errorMessages: ['Password must be between 6 and 30 characters long'],
    });
  },
});

export const firstNameField = t.String({
  minLength: 3,
  maxLength: 30,
  example: 'David',
  error() {
    throw new AppError({
      statusCode: 400,
      errorMessages: ['First name must be between 3 and 30 characters long'],
    });
  },
});

export const lastNameField = t.String({
  minLength: 3,
  maxLength: 30,
  example: 'Smith',
  error() {
    throw new AppError({
      statusCode: 400,
      errorMessages: ['Last name must be between 3 and 30 characters long'],
    });
  },
});
