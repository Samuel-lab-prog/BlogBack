import Elysia from 'elysia';
import { openapi } from '@elysiajs/openapi';
import cors from '@elysiajs/cors';

import { AppError } from './utils/AppError';
import { userRoutes } from './users/userRoute';
import { postRoutes } from './posts/postRoutes';

import runMigration from './db/migrations';

try {
  await runMigration();
} catch (err) {
  console.error('Migration failed:', err);
  process.exit(1);
}

function jsonResponse(status: number, body: object) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

new Elysia()
  .use(cors())
  .onError(({ error, set }) => {
    if (error instanceof AppError) {
      set.status = error.statusCode;

      console.error(
        `[AppError ${error.statusCode}]`,
        error.errorMessages.join(', '),
        error.originalError ?? ''
      );

      return jsonResponse(set.status, {
        errorMessages: error.errorMessages,
        statusCode: set.status,
        originalError:
          typeof error.originalError === 'object'
            ? String(error.originalError)
            : error.originalError,
      });
    }

    console.error('[Unexpected Error]', error);

    const statusCode =
      typeof set.status === 'number' && set.status >= 400
        ? set.status
        : 500;

    return jsonResponse(statusCode, {
      errorMessages: ['An unexpected error occurred'],
      statusCode,
      originalError: error instanceof Error ? error.message : String(error),
    });
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
  .listen({
    port: Number(process.env.PORT) || 3000,
    hostname: '0.0.0.0',
  });

console.log('Server running on port', process.env.PORT || 3000);
