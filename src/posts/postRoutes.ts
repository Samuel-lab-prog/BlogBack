import { Elysia, t } from 'elysia';
import { registerPost, listPosts, getPostBySlug, fetchTags, excludePostById } from './postController.ts';
import { errorSchema, AppError } from '../utils/AppError.ts';

const titleField = t.String({
  minLength: 3,
  maxLength: 150,
  example: 'Como aprender JavaScript',
  error() {
    throw new AppError({
      errorMessages: ['Invalid title: must be between 3 and 150 characters'],
      statusCode: 422,
    });
  },
});

const contentField = t.String({
  minLength: 100,
  example: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...',
  error() {
    throw new AppError({
      errorMessages: ['Content must have at least 100 characters'],
      statusCode: 422,
    });
  },
});

const excerptField = t.String({
  maxLength: 150,
  example: 'My Chemical Romance is the best band that ever existed. Here is why...',
  error() {
    throw new AppError({
      errorMessages: ['Excerpt must have at most 150 characters'],
      statusCode: 422,
    });
  },
});

const authorIdField = t.Number({
  example: 1,
  error() {
    throw new AppError({
      errorMessages: ['Invalid author ID'],
      statusCode: 422,
    });
  },
});
const tagsField = t.Array(t.String({ example: 'JavaScript' }),{
  minItems: 1,
  error() {
    throw new AppError({
      errorMessages: ['Tags must be an array of strings with at least one tag'],
      statusCode: 422,
    });
  }
});

export const postRoutes = (app: Elysia) =>
  app.group('/posts', (app) =>
    app
      .post(
        '/',
        async ({ body, set }) => {
          const post = await registerPost(body);
          set.status = 201;
          return post;
        },
        {
          body: t.Object({
            title: titleField,
            content: contentField,
            excerpt: excerptField,
            authorId: authorIdField,
            tags: tagsField
          }),
          response: {
            201: t.Object({
              id: t.Number(),
              title: t.String(),
              slug: t.String(),
              content: t.String(),
              excerpt: t.String(),
              authorId: t.Number(),
              createdAt: t.String(),
              updatedAt: t.String(),
              tags: t.Array(t.String()),
            }),
            400: errorSchema,
            422: errorSchema,
            409: errorSchema,
            500: errorSchema,
          },
          detail: {
            summary: 'Create a new post',
            description:
              'Creates a new post with title, content, excerpt, authorId and tags.',
            tags: ['Post'],
          },
        }
      )
      .get(
        '/',
        async ({ query }) => {
          const { limit = '20', tag = null } = query;
          const normalizedTag = tag === '' ? null : tag;
          return await listPosts(Number(limit), normalizedTag);
        },
        {
          response: {
            200: t.Array(t.Object({
              id: t.Number(),
              title: t.String(),
              slug: t.String(),
              excerpt: t.String(),
              createdAt: t.String(),
              updatedAt: t.String(),
              tags: t.Array(t.String()),
            })),
            500: errorSchema,
          },
          detail: {
            summary: 'List posts',
            description:
              'Returns a list of posts, omitting the content and authorId for performance reasons. Optionally filtered by tag and limited in number (default limit is 20)',
            tags: ['Post'],
          },
        }
      )
      .get(
        '/:slug',
        async ({ params }) => {
          const post = await getPostBySlug(params.slug);
          return post;
        },
        {
          response: {
            200: t.Object({
              id: t.Number(),
              title: t.String(),
              slug: t.String(),
              content: t.String(),
              excerpt: t.String(),
              authorId: t.Number(),
              createdAt: t.String(),
              updatedAt: t.String(),
              tags: t.Array(t.String()),
            }),
            404: errorSchema,
            500: errorSchema,
          },
          detail: {
            summary: 'Get a post by slug',
            description: 'Fetch all properties of a single post by its slug.',
            tags: ['Post'],
          },
        }
      )
      .get(
        '/tags',
        async () => {
          const tags = await fetchTags();
          return tags;
        },
        {
          response: {
            200: t.Array(t.String()),
            500: errorSchema,
          },
          detail: {
            summary: 'Get all tags',
            description: 'Fetch all unique tags from the database.',
            tags: ['Post'],
          },
        }
      )
      .delete(
        '/:id',
        async ({ params, set }) => {
          const success = await excludePostById(params.id);
          if (success) {
            set.status = 204;
          } else {
            throw new AppError({
              statusCode: 404,
              errorMessages: ['Post not found'],
            });
          }
        },
        {
          params: t.Object({
            id: t.Number({
              example: 1,
              error() {
                throw new AppError({
                  errorMessages: ['Invalid post ID'],
                  statusCode: 422,
                });
              },
            }),
          }),
          response: {
            204: t.Void(),
            404: errorSchema,
            500: errorSchema,
          },
          detail: {
            summary: 'Delete a post by ID',
            description: 'Removes a post from the database by its ID.',
            tags: ['Post'],
          },
        }
      )
    );
