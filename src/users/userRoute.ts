import { Elysia, t } from 'elysia';
import { registerUser, loginUser, authUser } from './userController';
import {
  registerUserBodySchema,
  registerUserResponseSchema,
  loginUserBodySchema,
  loginUserResponseSchema
} from './userSchemas';
import { errorSchema } from '../utils/AppError';
import { Cookie } from 'bun';

export const userRoutes = (app: Elysia) =>
  app.group('/users', (app) =>
    app
      .post(
        '/register',
        async ({ body, set }) => {
          const user = await registerUser(body);
          set.status = 201;
          return user;
        },
        {
          body: registerUserBodySchema,
          response: {
            201: registerUserResponseSchema,
            400: errorSchema,
            409: errorSchema,
            500: errorSchema,
          },
          detail: {
            summary: 'Register a new user',
            description:
              'Creates a new user with first name, last name, email and password. Returns the created user (without password).',
            tags: ['User'],
          },
        }
      )

      .post(
        '/login',
        async ({ body }) => {
          const result = await loginUser(body);
          new Cookie('token', result.token, {
            httpOnly: true,
          });
          return result.user;
        },
        {
          body: loginUserBodySchema,
          response: {
            200: loginUserResponseSchema,
            400: errorSchema,
            401: errorSchema,
            500: errorSchema,
          },
          detail: {
            summary: 'Login a user',
            description:
              'Authenticate a user with email and password. Returns the authenticated user and sets a secure JWT cookie.',
            tags: ['User'],
          },
        }
      )

      .get(
        '/auth',
        async ({ cookie: { token }, set }) => {
          if (!token?.value) {
            set.status = 401;
            return { isAdmin: false, message: 'Token missing' };
          }

          try {
            const isAdmin = await authUser(token.value);
            set.status = isAdmin ? 200 : 403;
            return { isAdmin };
          } catch (err) {
            console.error(err);
            set.status = 401;
            return { isAdmin: false, message: 'Invalid or expired token' };
          }
        },
        {
          response: {
            200: t.Object({ isAdmin: t.Boolean() }),
            401: errorSchema,
            403: errorSchema,
            500: errorSchema,
          },
          cookie: t.Object({
            token: t.Optional(t.String()),
          }),
          detail: {
            summary: 'Authenticate user token',
            description:
              'Validates the JWT token from cookies and returns whether the user is an admin.',
            tags: ['User'],
          },
        }
      )
  );
