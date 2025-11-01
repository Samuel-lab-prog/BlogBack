import { t } from 'elysia';
import { AppError } from './AppError';

export const errorSchema = t.Object({
  messages: t.Array(t.String()),
  statusCode: t.Number(),
});

// User schemas
export const registerUserBodySchema = t.Object({
  email: t.String({
    format: 'email',
    example: 'david@gmail.com',
    error() {
      throw new AppError({
        messages: [
          'Invalid email format: email must be a valid email address',
        ],
        statusCode: 422,
      });
    },
  }),
  password: t.String({
    minLength: 6,
    maxLength: 30,
    example: '12345678',
    error() {
      throw new AppError({
        messages: [
          'Invalid password format: password must be between 6 and 30 characters',
        ],
        statusCode: 422,
      });
    },
  }),
  firstName: t.String({
    minLength: 3,
    maxLength: 20,
    example: 'David',
    error() {
      throw new AppError({
        messages: [
          'Invalid first name format: first name must be between 3 and 20 characters',
        ],
        statusCode: 422,
      });
    },
  }),
  lastName: t.String({
    minLength: 3,
    maxLength: 20,
    example: 'Smith',
    error() {
      throw new AppError({
        messages: [
          'Invalid last name format: last name must be between 3 and 20 characters',
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
        messages: [
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
        messages: [
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

// Post schemas
export const postBodySchema = t.Object({
  title: t.String({
    minLength: 3,
    maxLength: 150,
    example: 'Como aprender JavaScript',
    error() {
      throw new AppError({
        messages: [
          'Invalid title: must be between 3 and 150 characters',
        ],
        statusCode: 422,
      });
    },
  }),
  content: t.String({
    minLength: 10,
    example: 'Conteúdo do post...',
    error() {
      throw new AppError({
        messages: ['Content must have at least 10 characters'],
        statusCode: 422,
      });
    },
  }),
  authorId: t.Number({ example: 1 }),
  tags: t.Optional(t.Array(t.String({ example: 'JavaScript' }))),
  status: t.Optional(
    t.Union([t.Literal('draft'), t.Literal('published')])
  ),
});

export const postResponseSchema = t.Object({
  id: t.Number(),
  title: t.String(),
  slug: t.String(),
  content: t.String(),
  authorId: t.Number(),
  status: t.String(),
  createdAt: t.String(),
  updatedAt: t.String(),
  tags: t.Array(t.String()),
});
