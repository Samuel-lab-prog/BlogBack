import Elysia from 'elysia';
import { openapi } from '@elysiajs/openapi';
import cors from '@elysiajs/cors';

import { AppError } from './utils/AppError';
import { userRoutes } from './users/userRoute';
import { postRoutes } from './posts/postRoutes';

const app = new Elysia()
  .use(cors())
  .onError(({ error, set }) => {
    if (error instanceof AppError) {
      console.error('AppError:', error.errorMessages.join(', '), error.statusCode);
      set.status = error.statusCode;
      return new Response(
        JSON.stringify({
          errorMessages: error.errorMessages,
          statusCode: set.status,
        }),
        {
          status: set.status,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    console.error('Unexpected Error:', (error as Error).message);
    const statusCode = typeof set.status === 'number' ? set.status : 500;
    return new Response(
      JSON.stringify({
        errorMessages: ['An unexpected error occurred'],
        statusCode: statusCode,
      }),
      {
        status: statusCode,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  })
  .use(userRoutes)
  .use(postRoutes)
  .use(
    openapi({
      path: '/docs',
      documentation: {
        info: {
          title: 'Blog API',
          description: 'API documentation for my personal Blog API',
          version: '1.0.0',
        },
      },
    })
  )
  .listen({ port: Number(process.env.PORT) || 3000 });

export default app;
