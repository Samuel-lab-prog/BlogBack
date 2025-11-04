import { t } from 'elysia';

export const registerUserBodySchema = t.Object({
  email: t.String({
    format: 'email',
    example: 'david@gmail.com',
  }),
  password: t.String({
    minLength: 6,
    maxLength: 30,
    example: '12345678',
  }),
  firstName: t.String({
    minLength: 3,
    maxLength: 30,
    example: 'David',
  }),
  lastName: t.String({
    minLength: 3,
    maxLength: 30,
    example: 'Smith',
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
  }),
  password: t.String({
    minLength: 6,
    maxLength: 30,
    example: '12345678',
  }),
});

export const loginUserResponseSchema = t.Object({
  firstName: t.String(),
  lastName: t.String(),
  email: t.String(),
  id: t.Number(),
  isAdmin: t.Boolean(),
});
