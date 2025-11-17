import { Elysia, t } from 'elysia';
import { registerUser, loginUser, authenticateUser } from './userController';
import { AppError, errorSchema } from '../utils/AppError';
import { emailField, passwordField, firstNameField, lastNameField } from './userSchemas';

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
            email: emailField,
            password: passwordField,
            firstName: firstNameField,
            lastName: lastNameField,
          }),
          response: {
            201: t.Object({ id: t.Number() }, { description: 'User successfully registered.' }),
            400: errorSchema,
            409: errorSchema,
            500: errorSchema,
          },
          detail: {
            summary: 'Register a new user',
            description: 'Creates a new user. Returns an Object with the userId.',
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
              {
                description:
                  'Successful login, JWT set in HTTP-only cookie and user information returned.',
              }
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
          if (!token?.value) {
            throw new AppError({
              statusCode: 400,
              errorMessages: ['Authentication token is required'],
            });
          }
          const user = await authenticateUser(token.value);
          set.status = 200;
          return user;
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
            200: t.Object(
              {
                id: t.Number(),
                email: t.String(),
                isAdmin: t.Boolean(),
                firstName: t.String(),
                lastName: t.String(),
              },
              { description: 'User successfully authenticated.' }
            ),
            400: errorSchema,
            404: errorSchema,
            500: errorSchema,
          },
          detail: {
            summary: 'Authenticate user',
            description: 'Validates JWT token from cookies and returns user info.',
            tags: ['User'],
          },
        }
      )
  );
