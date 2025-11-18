import Elysia from 'elysia';
import { openapi } from '@elysiajs/openapi';
import cors from '@elysiajs/cors';
import { handleError } from './middlewares/handleError';
import { userRoutes } from './users/userRoute';
import { postRoutes } from './posts/postRoutes';

new Elysia()
.onError(async ({error, set}) => handleError(set, error))
.use(cors())
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
  .listen({
    port: Number(process.env.PORT) || 3000,
    hostname: '0.0.0.0',
  });

console.log('Server running on port', process.env.PORT || 3000);
