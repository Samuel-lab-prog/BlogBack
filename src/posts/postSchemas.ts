import { t } from 'elysia';
import { AppError } from '../utils/AppError';

export const titleField = t.String({
  minLength: 3,
  maxLength: 150,
  error() {
    throw new AppError({
      errorMessages: ['Invalid title: must be between 3 and 150 characters'],
      statusCode: 422,
    });
  },
});

export const contentField = t.String({
  minLength: 100,
  error() {
    throw new AppError({
      errorMessages: ['Content must have at least 100 characters'],
      statusCode: 422,
    });
  },
});

export const excerptField = t.String({
  maxLength: 150,
  error() {
    throw new AppError({
      errorMessages: ['Excerpt must have at most 150 characters'],
      statusCode: 422,
    });
  },
});

export const tagsField = t.Array(t.String(), {
  minItems: 1,
  uniqueItems: true,
  error() {
    throw new AppError({
      errorMessages: ['Tags must be an array with at least 1 unique tag'],
      statusCode: 422,
    });
  },
});

export const patchTagsField = t.Array(t.String(), {
  uniqueItems: true,
});