import { Elysia, t } from 'elysia';
import { registerUser, loginUser } from './userController';
import { AppError, errorSchema } from '../utils/AppError';

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
                  statusCode: 400,
                  errorMessages: ['Email must be a valid email address'],
                });
              }
            }),
            password: t.String({
              minLength: 6,
              maxLength: 30,
              example: '12345678',
              error() {
                throw new AppError({
                  statusCode: 400,
                  errorMessages: ['Password must be between 6 and 30 characters long'],
                });
              }
            }),
            firstName: t.String({
              minLength: 3,
              maxLength: 30,
              example: 'David',
              error() {
                throw new AppError({
                  statusCode: 400,
                  errorMessages: ['First name must be between 3 and 30 characters long'],
                });
              }
            }),
            lastName: t.String({
              minLength: 3,
              maxLength: 30,
              example: 'Smith',
              error() {
                throw new AppError({
                  statusCode: 400,
                  errorMessages: ['Last name must be between 3 and 30 characters long'],
                });
              }
            }),
          }),
          response: {
            201: t.Object({
              id: t.Number(),
              email: t.String(),
              firstName: t.String(),
              lastName: t.String(),
            }, { description: 'User successfully registered: Returns users\'s first name and last name.', }),
            400: t.Object({ errorSchema }, { description: 'Bad Request: Invalid request body.', }),
            409: t.Object({ errorSchema }, { description: 'Conflict: Email already registered.', }),
            500: t.Object({ errorSchema }, { description: 'Internal Server Error: Unexpected error occurred.', }),
          },
          detail: {
            summary: 'Register a new user',
            description:
              'Creates a new user. Returns the first and last name of the user.',
            tags: ['User'],
          },
        }
      )

      .post(
        '/login',
        async ({ body, set }) => {
          const { token, user } = await loginUser(body);
          set.cookie = {
            token: {
              value: token,
              httpOnly: true,
            },
          };
          set.headers = {
            cookie: `token=${token}`,
          };
          return user;
        },
        {
          body: t.Object({
            email: t.String({
              format: 'email',
              example: 'david@gmail.com',
              error() {
                throw new AppError({
                  statusCode: 400,
                  errorMessages: ['Email must be a valid email address'],
                });
              }
            }),
            password: t.String({
              minLength: 6,
              maxLength: 30,
              example: '12345678',
              error() {
                throw new AppError({
                  statusCode: 400,
                  errorMessages: ['Password must be between 6 and 30 characters long'],
                });
              }
            }),
          }),

          response: {
            200: t.Object({
              firstName: t.String(),
              lastName: t.String(),
            }, { description: 'Successful login response: Returns the user first and last name and sets a cookie with the JWT token.', }),
            400: t.Object({
              errorSchema,
            }, { description: 'Bad Request: Invalid request body.', }),
            401: t.Object({
              errorSchema,
            }, { description: 'Unauthorized: Invalid credentials.', }),
            500: t.Object({
              errorSchema,
            }, { description: 'Internal Server Error: Unexpected error occurred.', }),
          },
          detail: {
            summary: 'Login a user',
            description:
              'Authenticates a user and returns a JWT token in an HTTP-only cookie.',
            tags: ['User'],
          },

        }
      )
  );


