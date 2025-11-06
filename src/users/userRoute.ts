import { Elysia, t } from 'elysia';
import { registerUser, loginUser, authenticateUser } from './userController';
import { AppError, errorSchema } from '../utils/AppError';

const emailField = t.String({
  format: 'email',
  example: 'david@gmail.com',
  error() {
    throw new AppError({
      statusCode: 400,
      errorMessages: ['Email must be a valid email address'],
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
            201: t.Object(
              {
                id: t.Number(),
                email: t.String(),
                firstName: t.String(),
                lastName: t.String(),
              },
              {
                description:
                  "User successfully registered: Returns users's first name and last name.",
              }
            ),
            400: t.Object({ errorSchema }, { description: 'Bad Request: Invalid request body.' }),
            409: t.Object({ errorSchema }, { description: 'Conflict: Email already registered.' }),
            500: t.Object(
              { errorSchema },
              { description: 'Internal Server Error: Unexpected error occurred.' }
            ),
          },
          detail: {
            summary: 'Register a new user',
            description: 'Creates a new user. Returns the first and last name of the user.',
            tags: ['User'],
          },
        }
      )

      .post(
        '/login',
        async ({ body, cookie }) => {
          const { token, user } = await loginUser(body);
          cookie.token.value = token;
          return user;
        },
        {
          cookie: t.Cookie(
            {
              token: t.String({
                description:
                  'JWT token declared with an empty value to be set upon successful login.',
              }),
            },
            {
              value: '',
            }
          ),
          body: t.Object({
            email: emailField,
            password: passwordField,
          }),

          response: {
            200: t.Object(
              {
                firstName: t.String(),
                lastName: t.String(),
              },
              {
                description:
                  'Successful login response: Returns the user first and last name and sets a cookie with the JWT token.',
              }
            ),
            400: t.Object(
              {
                errorSchema,
              },
              { description: 'Bad Request: Invalid request body.' }
            ),
            401: t.Object(
              {
                errorSchema,
              },
              { description: 'Unauthorized: Invalid credentials.' }
            ),
            500: t.Object(
              {
                errorSchema,
              },
              { description: 'Internal Server Error: Unexpected error occurred.' }
            ),
          },
          detail: {
            summary: 'Login a user',
            description: 'Authenticates a user and returns a JWT token in an HTTP-only cookie.',
            tags: ['User'],
          },
        }
      )
      .get(
        '/auth',
        async ({ cookie: { token }, set }) => {
          const isAdmin = await authenticateUser(token.value);
          if (!isAdmin) {
            throw new AppError({
              statusCode: 403,
              errorMessages: ['Access denied: Admins only'],
            });
          }
          set.status = 204;
        },
        {
          cookie: t.Cookie({
            token: t.String({
              description: 'JWT token stored in an HTTP-only cookie for authentication.',
              error() {
                throw new AppError({
                  statusCode: 400,
                  errorMessages: ['Authentication token is required in cookies'],
                });
              },
            }),
          }),
          response: {
            204: t.Void({ description: 'Success: User is an admin.' }),
            403: t.Object(
              { errorSchema },
              { description: 'Forbidden: Access denied for non-admin users.' }
            ),
            404: t.Object({ errorSchema }, { description: 'Not Found: User not found.' }),
            500: t.Object(
              { errorSchema },
              { description: 'Internal Server Error: Unexpected error occurred.' }
            ),
          },
          detail: {
            summary: 'Check admin status',
            description:
              'Verifies the JWT token from the cookie and checks if the user is an admin.',
            tags: ['User'],
          },
        }
      )
  );
