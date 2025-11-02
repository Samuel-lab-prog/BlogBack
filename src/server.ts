import Elysia from 'elysia';
import { openapi } from '@elysiajs/openapi';
import cors from '@elysiajs/cors';

import { AppError } from './utils/AppError';
import { userRoutes } from './users/userRoute';
import { postRoutes } from './posts/postRoutes';

const app = new Elysia()
  .use(cors())
  .use(
    openapi({
      path: '/docs',
      documentation: {
        info: {
          title: 'Blog API',
          description: 'API documentation for my personal Blog API',
          version: '1.0.0',
        },
      }
    })
  )
  .onError(({ error }) => {
    if (error instanceof AppError) {
      return new Response(
        JSON.stringify({
          errorMessages: error.errorMessages,
          statusCode: error.statusCode,
        }),
        {
          status: error.statusCode,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    return new Response(
      JSON.stringify({
        errorMessages: ['Internal server error'],
        statusCode: 500,
        error: error,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  })
  .use(userRoutes)
  .use(postRoutes)
  .listen({ port: Number(process.env.PORT) || 3000 });

export default app;
