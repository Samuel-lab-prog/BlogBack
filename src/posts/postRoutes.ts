import { Elysia, t } from 'elysia';
import {
  registerPost,
  listPosts,
  getPostBySlug,
  fetchTags
} from './postController.ts';
import { postBodySchema, postResponseSchema } from './postSchemas.ts';
import { errorSchema } from '../utils/AppError.ts';

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
          body: postBodySchema,
          response: {
            201: postResponseSchema,
            400: errorSchema,
            422: errorSchema,
            409: errorSchema,
            500: errorSchema,
          },
          detail: {
            summary: 'Create a new post',
            description:
              'Creates a new post with title, content, authorId and optional tags and status.',
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
            200: t.Array(postResponseSchema),
            500: errorSchema,
          },
          detail: {
            summary: 'List all posts with a limit (default 20). Optionally filter by tag.',
            description: 'Returns all posts.',
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
            200: postResponseSchema,
            404: errorSchema,
            500: errorSchema,
          },
          detail: {
            summary: 'Get a post by slug',
            description: 'Fetch a single post by its slug.',
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
  );
