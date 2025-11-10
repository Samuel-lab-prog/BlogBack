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
  example:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...',
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

const tagsField = t.Array(t.String({ example: 'JavaScript' }), {
  minItems: 1,
  uniqueItems: true,
  error() {
    throw new AppError({
      errorMessages: ['Tags must be an array of strings with at least one tag'],
      statusCode: 422,
    });
  },
});

async function requireAdmin(cookie: { token?: { value: string } }) {
  const token = cookie.token?.value;
  if (!token) throw new AppError({ statusCode: 401, errorMessages: ['Authentication required'] });
  const context = await authenticateUser(token);
  if (!context.isAdmin) throw new AppError({ statusCode: 403, errorMessages: ['Admin only'] });
  return context;
}

export const postRoutes = (app: Elysia) =>
  app.group('/posts', (app) =>
    app
      .post(
        '/',
        async ({ body, cookie, set }) => {
          const context = await requireAdmin(cookie);
          const fullBody = { ...body, authorId: context.id };
          const post = await registerPost(fullBody);
          set.status = 201;
          return post;
        },
        {
          body: t.Object(
            {
              title: titleField,
              content: contentField,
              excerpt: excerptField,
              tags: tagsField,
            },
            {
              examples: {
                'application/json': {
                  title: 'How to learn anything fast',
                  content:
                    'Have you ever wanted to learn something new but felt overwhelmed by the amount of information out there? In this post, I will share some tips and strategies that helped me learn new skills quickly and effectively...',
                  excerpt: 'Learning made easy: Tips to accelerate your learning',
                  tags: ['JavaScript', 'Programming'],
                },
              },
            }
          ),
          response: {
            201: t.Object({
              id: t.Number(),
              title: t.String(),
              slug: t.String(),
              content: t.String(),
              excerpt: t.String(),
              tags: t.Array(t.String()),
              createdAt: t.String(),
              updatedAt: t.String(),
            }),
            400: errorSchema,
            422: errorSchema,
            409: errorSchema,
            500: errorSchema,
          },
          detail: {
            summary: 'Create a new post',
            description: 'Creates a new post with title, content, excerpt, and tags. Admin only.',
            tags: ['Post'],
          },
        }
      )

      .get(
        '/',
        async ({ query }) => {
          const limit = Number(query.limit ?? 20);
          if (isNaN(limit) || limit < 1 || limit > 100)
            throw new AppError({ statusCode: 422, errorMessages: ['Invalid limit'] });
          const tag = query.tag ?? null;
          return await listPosts(limit, tag);
        },
        {
          response: {
            200: t.Array(
              t.Object({
                id: t.Number(),
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
            description:
              'Returns a list of posts, optionally filtered by tag and limited in number (default limit 20).',
            tags: ['Post'],
          },
        }
      )
      .get(
        '/tags',
        async () => {
          return await fetchTags();
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

      .get(
        '/:title',
        async ({ params }) => {
          return await getPostByTitle(params.title);
        },
        {
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
            summary: 'Get a post by title',
            description: 'Fetch a single post by its title.',
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
          params: t.Object({ title: titleField }),
          response: {
            204: t.Void(),
            404: errorSchema,
            500: errorSchema,
          },
          detail: {
            summary: 'Delete a post by title',
            description: 'Admin only. Removes a post from the database by its title.',
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
          params: t.Object({ title: titleField }),
          response: {
            204: t.Void(),
            404: errorSchema,
            422: errorSchema,
            500: errorSchema,
          },
          detail: {
            summary: 'Update a post by title',
            description: 'Admin only. Updates a post in the database by its title.',
            tags: ['Post'],
          },
        }
      )
  );
