import { Elysia, t } from 'elysia';
import { registerUser, loginUser } from './userController';
import { AppError, errorObject } from '../utils/AppError';

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
          body: t.Object({
            email: t.String({
              format: 'email',
              example: 'david@gmail.com',
              error() {
                throw new AppError({
                  messages: [
                    'Invalid email format: email must be a valid email address',
                  ],
                  statusCode: 422,
                });
              },
            }),
            password: t.String({
              minLength: 6,
              maxLength: 30,
              example: '12345678',
              error() {
                throw new AppError({
                  messages: [
                    'Invalid password format: password must be between 6 and 30 characters',
                  ],
                  statusCode: 422,
                });
              },
            }),
            firstName: t.String({
              minLength: 3,
              maxLength: 20,
              example: 'David',
              error() {
                throw new AppError({
                  messages: [
                    'Invalid first name format: first name must be between 3 and 20 characters',
                  ],
                  statusCode: 422,
                });
              },
            }),
            lastName: t.String({
              minLength: 3,
              maxLength: 20,
              example: 'Smith',
              error() {
                throw new AppError({
                  messages: [
                    'Invalid last name format: last name must be between 3 and 20 characters',
                  ],
                  statusCode: 422,
                });
              },
            }),
          }),
          response: {
            201: t.Object({
              id: t.Number(),
              email: t.String(),
              firstName: t.String(),
              lastName: t.String(),
            }),
            422: errorObject,
            409: errorObject,
            500: errorObject,
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
          body: t.Object({
            email: t.String({
              format: 'email',
              example: 'david@gmail.com',
              error() {
                throw new AppError({
                  messages: [
                    'Invalid email format: email must be a valid email address',
                  ],
                  statusCode: 422,
                });
              },
            }),
            password: t.String({
              example: '12345678',
              error() {
                throw new AppError({
                  messages: [
                    'Invalid password format: password must be at least 6 characters long',
                  ],
                  statusCode: 422,
                });
              },
            }),
          }),
          response: {
            200: t.Object({
              token: t.String({ example: 'jwt.token.here' }),
              user: t.Object({
                id: t.Number(),
                email: t.String(),
                firstName: t.String(),
                lastName: t.String(),
              }),
            }),
            401: errorObject,
            500: errorObject,
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
