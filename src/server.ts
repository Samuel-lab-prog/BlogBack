import Elysia from 'elysia';
import { openapi } from '@elysiajs/openapi';
import { userRoutes } from './users/userRoute';
import { AppError } from './utils/AppError';
import cors from '@elysiajs/cors';

const app = new Elysia()

  .use(cors())
  .use(
    openapi({
      path: '/docs',
    })
  )
  .onError(({ error }) => {
    if (error instanceof AppError) {
      return new Response(
        JSON.stringify({
          messages: error.messages,
          statusCode: error.statusCode,
        }),
        {
          status: error.statusCode,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  })
  .use(userRoutes)
  .listen({ port: Number(process.env.PORT) || 3000 });

export default app;
