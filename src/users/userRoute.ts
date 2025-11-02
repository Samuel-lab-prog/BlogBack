import { Elysia } from 'elysia';
import { registerUser, loginUser } from './userController';
import {
  registerUserBodySchema,
  registerUserResponseSchema,
  loginUserBodySchema,
  loginUserResponseSchema,
} from './userSchemas';
import { errorSchema } from '../utils/AppError';

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
            422: errorSchema,
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
        async ({ body, set }) => {
          const result = await loginUser(body);
          set.status = 200;
          return result;
        },
        {
          body: loginUserBodySchema,
          response: {
            200: loginUserResponseSchema,
            401: errorSchema,
            500: errorSchema,
          },
          detail: {
            summary: 'Login a user',
            description:
              'Authenticate a user with email and password. Returns a JWT token if successful.',
            tags: ['User'],
          },
        }
      )
  );
