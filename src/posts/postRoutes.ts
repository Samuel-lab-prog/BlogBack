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
  error() {
    throw new AppError({
      errorMessages: ['Tags must be an array of strings with at least one tag'],
      statusCode: 422,
    });
  },
});

export const postRoutes = (app: Elysia) =>
  app.group('/posts', (app) =>
    app
      .post(
        '/',
        async ({ body, set }) => {
          await registerPost(body);
          set.status = 201;
        },
        {
          body: t.Object({
            title: titleField,
            content: contentField,
            excerpt: excerptField,
            tags: tagsField,
          },{
            examples: {
              'application/json': {
                title: 'How to learn anything fast',
                content: 'Have you ever wanted to learn something new but felt overwhelmed by the amount of information out there? In this post, I will share some tips and strategies that helped me learn new skills quickly and effectively. First, set clear goals and break down the learning process into manageable chunks. Second, use active learning techniques such as summarizing, questioning, and teaching others. Third, practice regularly and seek feedback to improve your understanding. By following these steps, you can accelerate your learning and achieve your goals faster than you thought possible.',
                excerpt: 'Learning don\'t have to be hard. Here are some tips to learn anything fast!',
                authorId: 1,
                tags: ['JavaScript', 'Programming'],
              },
            },
          }),
          response: {
            201: t.Void(),
            400: errorSchema,
            422: errorSchema,
            409: errorSchema,
            500: errorSchema,
          },
          detail: {
            summary: 'Create a new post',
            description: 'Creates a new post with title, content, excerpt, and tags.',
            tags: ['Post'],
          },
        }
      )
      .get(
        '/',
        async ({ query }) => {
          const { limit = '20', tag = null } = query;
          return await listPosts(Number(limit), tag);
        },
        {
          response: {
            200: t.Array(
              t.Object({
                title: t.String(),
                excerpt: t.String(),
                createdAt: t.String(),
                updatedAt: t.String(),
                tags: t.Array(t.String()),
              })
            ),
            500: errorSchema,
          },
          detail: {
            summary: 'List posts',
            description:
              'Returns a list of posts, including only the title, excerpt, createdAt, updatedAt, and tags for performance reasons. Optionally filtered by tag and limited in number (default limit is 20)',
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
            description: 'Fetch all properties except id and authorId of a single post by its title.',
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
      .delete(
        '/:title',
        async ({ params, set }) => {
          await excludePostByTitle(params.title);
          set.status = 204;
        },
        {
          params: t.Object({
            title: t.String({
              example: 'Diário de Estudo',
              error() {
                throw new AppError({
                  errorMessages: ['Invalid post title'],
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
            summary: 'Delete a post by title',
            description: 'Removes a post from the database by its title.',
            tags: ['Post'],
          },
        }
      )
      .patch(
        '/:title',
        async ({ params, body, set }) => {
        await refreshPostByTitle(params.title, body);
        set.status = 204;
        },
        {
          
          body: t.Partial(
            t.Object(
              {
                title: titleField,
                content: contentField,
                excerpt: excerptField,
                tags: tagsField,
              },
              {
                example: {
                  title: 'Dear diary: My study day',
                  content: `Today I studied SQL and how to integrate relational databases into web applications... In addition, I reviewed normalization concepts and best practices for data modeling. Finally, I practiced complex queries and data manipulation using SQL commands. I strongly recommend that anyone looking to deepen their web development skills take the time to understand relational databases, as they are fundamental to most modern applications.`,
                  excerpt: 'How was my study today!',
                  tags: ['JavaScript', 'Study', 'SQL'],
                },
              }
            )
          ),
          params: t.Object({
            title: t.String({
              example: 'Dear diary: My study day',
            }),
          }),
          response: {
            204: t.Void(),
            404: errorSchema,
            500: errorSchema,
          },
          detail: {
            summary: 'Update a post by title',
            description: 'Updates a post in the database by its title.',
            tags: ['Post'],
          },
        }
      )
  );
