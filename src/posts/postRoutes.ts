import { Elysia, t } from 'elysia';
import {
  registerPost,
  listPosts,
  getPostByTitle,
  fetchTags,
  excludePostByTitle,
  refreshPostByTitle,
} from './postController.ts';
import { errorSchema, AppError } from '../utils/AppError.ts';
import { authenticateUser } from '../users/userController.ts';

const titleField = t.String({
  minLength: 3,
  maxLength: 150,
  error() {
    throw new AppError({
      errorMessages: ['Invalid title: must be between 3 and 150 characters'],
      statusCode: 422,
    });
  },
});

const contentField = t.String({
  minLength: 100,
  error() {
    throw new AppError({
      errorMessages: ['Content must have at least 100 characters'],
      statusCode: 422,
    });
  },
});

const excerptField = t.String({
  maxLength: 150,
  error() {
    throw new AppError({
      errorMessages: ['Excerpt must have at most 150 characters'],
      statusCode: 422,
    });
  },
});

const tagsField = t.Array(t.String(), {
  minItems: 1,
  uniqueItems: true,
  error() {
    throw new AppError({
      errorMessages: ['Tags must be an array with at least 1 unique tag'],
      statusCode: 422,
    });
  },
});


async function requireAdmin(cookie: { token?: { value: string } }) {
  const token = cookie.token?.value;
  if (!token)
    throw new AppError({ statusCode: 401, errorMessages: ['Authentication required'] });

  const context = await authenticateUser(token);

  if (!context.isAdmin)
    throw new AppError({ statusCode: 403, errorMessages: ['Admin only'] });

  return context;
}

export const postRoutes = (app: Elysia) =>
  app.group('/posts', (app) =>
    app

      .post(
        '/',
        async ({ body, cookie, set }) => {
          const context = await requireAdmin(cookie);
          const fullData = { ...body, authorId: context.id };

          const post = await registerPost(fullData);
          set.status = 201;
          return post;
        },
        {
          body: t.Object({
            title: titleField,
            content: contentField,
            excerpt: excerptField,
            tags: tagsField,
          }),
          response: {
            201: t.Object({
              id: t.Number(),
            }),
            400: errorSchema,
            422: errorSchema,
            409: errorSchema,
            500: errorSchema,
          },
          detail: {
            summary: 'Create post',
            description: 'Admin only.',
            tags: ['Post'],
          },
        }
      )

      .get(
        '/',
        async ({ query }) => {
          const limit = Number(query.limit ?? 20);

          if (isNaN(limit) || limit < 1 || limit > 100)
            throw new AppError({
              statusCode: 422,
              errorMessages: ['Invalid limit'],
            });

          const tag = query.tag ?? null;
          return await listPosts(limit, tag);
        },
        {
          query: t.Object({
            limit: t.Optional(t.Numeric()),
            tag: t.Optional(t.String()),
          }),
          response: {
            200: t.Array(
              t.Object({
                title: t.String(),
                slug: t.String(),
                excerpt: t.String(),
                createdAt: t.String(),
                updatedAt: t.String(),
                tags: t.Array(t.String()),
              })
            ),
            422: errorSchema,
            500: errorSchema,
          },
          detail: {
            summary: 'List posts',
            description: 'Optional tag filter.',
            tags: ['Post'],
          },
        }
      )

      .get(
        '/tags',
        async () => await fetchTags(),
        {
          response: {
            200: t.Array(t.String()),
            500: errorSchema,
          },
          detail: {
            summary: 'Fetch tags',
            tags: ['Post'],
          },
        }
      )

      .get(
        '/:title',
        async ({ params }) => await getPostByTitle(params.title),
        {
          params: t.Object({
            title: t.String(),
          }),
          response: {
            200: t.Object({
              title: t.String(),
              slug: t.String(),
              content: t.String(),
              excerpt: t.String(),
              createdAt: t.String(),
              updatedAt: t.String(),
              tags: t.Array(t.String()),
            }),
            404: errorSchema,
            500: errorSchema,
          },
          detail: {
            summary: 'Get post by title',
            tags: ['Post'],
          },
        }
      )

      .delete(
        '/:title',
        async ({ params, cookie, set }) => {
          await requireAdmin(cookie);
          await excludePostByTitle(params.title);
          set.status = 204;
        },
        {
          params: t.Object({ title: t.String() }),
          response: {
            204: t.Void(),
            404: errorSchema,
            500: errorSchema,
          },
          detail: {
            summary: 'Delete post',
            description: 'Admin only.',
            tags: ['Post'],
          },
        }
      )

      .patch(
        '/:title',
        async ({ params, body, cookie, set }) => {
          await requireAdmin(cookie);
          await refreshPostByTitle(params.title, body);
          set.status = 204;
        },
        {
          body: t.Partial(
            t.Object({
              title: titleField,
              content: contentField,
              excerpt: excerptField,
              tags: tagsField,
            })
          ),
          params: t.Object({
            title: t.String(),
          }),
          response: {
            204: t.Void(),
            404: errorSchema,
            422: errorSchema,
            500: errorSchema,
          },
          detail: {
            summary: 'Update post',
            description: 'Partial update. Admin only.',
            tags: ['Post'],
          },
        }
      )
  );
