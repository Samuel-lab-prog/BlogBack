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
import {
  titleField,
  contentField,
  excerptField,
  tagsField,
  patchTagsField,
} from './postSchemas.ts';

async function requireAdmin(cookie?: { token?: { value?: string } }) {
  const token = cookie?.token?.value;

  if (!token) {
    throw new AppError({
      statusCode: 401,
      errorMessages: ['Authentication required'],
    });
  }

  const context = await authenticateUser(token);

  if (!context.isAdmin) {
    throw new AppError({
      statusCode: 403,
      errorMessages: ['Admin only'],
    });
  }

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
            201: t.Object({ id: t.Number() }),
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
          const rawLimit = query.limit ?? '20';
          const limit = Number(rawLimit);

          if (isNaN(limit) || limit < 1 || limit > 100) {
            throw new AppError({
              statusCode: 422,
              errorMessages: ['Invalid limit'],
            });
          }

          const tag = query.tag ?? null;
          return listPosts(limit, tag);
        },
        {
          query: t.Object({
            limit: t.Optional(t.String()),
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

      .get('/tags', async () => fetchTags(), {
        response: {
          200: t.Array(t.String()),
          500: errorSchema,
        },
        detail: {
          summary: 'Fetch tags',
          tags: ['Post'],
        },
      })

      .get(
        '/:title',
        async ({ params }) => getPostByTitle(params.title),
        {
          params: t.Object({ title: t.String() }),
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
              tags: patchTagsField, 
            })
          ),
          params: t.Object({ title: t.String() }),
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
