import { Elysia, t } from 'elysia';
import {
  registerPost,
  listPosts,
  listPostsByTag,
  getPostBySlug
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
        async ({ set }) => {
          const posts = await listPosts();
          set.status = 200;
          return posts;
        },
        {
          response: {
            200: t.Array(postResponseSchema),
            500: errorSchema,
          },
          detail: {
            summary: 'List all posts',
            description: 'Returns all posts with their tags.',
            tags: ['Post'],
          },
        }
      )
      .get(
        '/tags/:tag',
        async ({ params, set }) => {
          const posts = await listPostsByTag(params.tag);
          set.status = 200;
          return posts;
        },
        {
          response: {
            200: t.Array(postResponseSchema),
            400: errorSchema,
            500: errorSchema,
          },
          detail: {
            summary: 'List posts by tag',
            description:
              'Fetch all posts associated with a specific tag.',
            tags: ['Post'],
          },
        }
      )
      .get(
        '/:slug',
        async ({ params, set }) => {
          const post = await getPostBySlug(params.slug);
          set.status = 200;
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
  );
