import { Elysia, t } from 'elysia';
import { registerUser, loginUser, authenticateUser } from './userController';
import { AppError, errorSchema } from '../utils/AppError';

const emailField = t.String({
  format: 'email',
  example: 'david@gmail.com',
  error() {
    throw new AppError({
      statusCode: 400,
      errorMessages: ['Invalid email format'],
    });
  },
});

const passwordField = t.String({
  minLength: 6,
  maxLength: 30,
  example: '12345678',
  error() {
    throw new AppError({
      statusCode: 400,
      errorMessages: ['Password must be between 6 and 30 characters long'],
    });
  },
});

const firstNameField = t.String({
  minLength: 3,
  maxLength: 30,
  example: 'David',
  error() {
    throw new AppError({
      statusCode: 400,
      errorMessages: ['First name must be between 3 and 30 characters long'],
    });
  },
});

const lastNameField = t.String({
  minLength: 3,
  maxLength: 30,
  example: 'Smith',
  error() {
    throw new AppError({
      statusCode: 400,
      errorMessages: ['Last name must be between 3 and 30 characters long'],
    });
  },
});

export const userRoutes = (app: Elysia) =>
  app.group('/users', (app) =>
    app
      .post(
        '/register',
        async ({ body, set }) => {
          await registerUser(body);
          set.status = 201;
        },
        {
          body: t.Object({
            email: emailField,
            password: passwordField,
            firstName: firstNameField,
            lastName: lastNameField,
          }),
          response: {
            201: t.Void({ description: 'User successfully registered.' }),
            400: errorSchema,
            409: errorSchema,
            500: errorSchema,
          },
          detail: {
            summary: 'Register a new user',
            description: 'Creates a new user. Does not return any content.',
            tags: ['User'],
          },
        }
      )
      .post(
        '/login',
        async ({ body, set }) => {
          const { token, user } = await loginUser(body);
          set.headers['Set-Cookie'] =
            `token=${token}; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=3600`;
          return user;
        },
        {
          body: t.Object({
            email: emailField,
            password: passwordField,
          }),
          response: {
            200: t.Object(
              {
                id: t.Number(),
                email: t.String(),
                isAdmin: t.Boolean(),
                firstName: t.String(),
                lastName: t.String(),
              },
              { description: 'Successful login, JWT set in HTTP-only cookie and user information returned.' }
            ),
            400: errorSchema,
            401: errorSchema,
            500: errorSchema,
          },
          detail: {
            summary: 'Login a user',
            description: 'Authenticates user and returns JWT token in cookie.',
            tags: ['User'],
          },
        }
      )
      .get(
        '/auth',
        async ({ cookie: { token }, set }) => {
          const context = await authenticateUser(token.value);
          if (context.isAdmin) {
            set.status = 204;
          } else {
            throw new AppError({
              statusCode: 403,
              errorMessages: ['User is not an admin'],
            });
          }
        },
        {
          cookie: t.Cookie({
            token: t.String({
              description: 'JWT token stored in HTTP-only cookie for authentication.',
              error() {
                throw new AppError({
                  statusCode: 400,
                  errorMessages: ['Authentication token is required in cookies'],
                });
              },
            }),
          }),
          response: {
            204: t.Void({ description: 'User is authenticated and is an admin.' }),
            403: errorSchema,
            404: errorSchema,
            500: errorSchema,
          },
          detail: {
            summary: 'Check admin status',
            description: 'Verifies JWT token and checks if the user is an admin.',
            tags: ['User'],
          },
        }
      )
  );
