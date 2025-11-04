import { t } from 'elysia';
import { AppError } from '../utils/AppError';

export const postBodySchema = t.Object({
  title: t.String({
    minLength: 3,
    maxLength: 150,
    example: 'Como aprender JavaScript',
    error() {
      throw new AppError({
        errorMessages: ['Invalid title: must be between 3 and 150 characters'],
        statusCode: 422,
      });
    },
  }),
  content: t.String({
    minLength: 10,
    example: 'Conteúdo do post...',
    error() {
      throw new AppError({
        errorMessages: ['Content must have at least 10 characters'],
        statusCode: 422,
      });
    },
  }),
  excerpt: t.String({
    maxLength: 100,
    example: 'Este é um resumo do post...',
  }),
  authorId: t.Number({ example: 1 }),
  tags: t.Array(t.String({ example: 'JavaScript' })),
});

export const postResponseSchema = t.Object({
  id: t.Number(),
  title: t.String(),
  slug: t.String(),
  content: t.String(),
  excerpt: t.String(),
  authorId: t.Number(),
  createdAt: t.String(),
  updatedAt: t.String(),
  tags: t.Array(t.String()),
});
