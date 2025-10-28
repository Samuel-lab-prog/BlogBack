import { Elysia, t } from "elysia";
import { registerUser, loginUser } from "./userController";

export const userRoutes = (app: Elysia) =>
  app.group("/users", (app) =>
    app
      .post(
        "/register",
        async ({ body, set }) => {
          const user = await registerUser(body);
          set.status = 201;
          return user;
        },
        {
          body: t.Object({
            email: t.String({ format: "email", example: "david@gmail.com", }),
            password: t.String({ minLength: 6, maxLength: 30, example: "12345678" }),
            firstName: t.String({ minLength: 3, maxLength: 20, example: "David" }),
            lastName: t.String({ minLength: 3, maxLength: 20, example: "Smith" }),
          }),
          response: {
            201: t.Object({
              id: t.Number(),
              email: t.String(),
              firstName: t.String(),
              lastName: t.String(),
            }),
            422: t.Object({
              errors: t.Array(t.String()),
            }),
            409: t.Object({
              errors: t.Array(t.String()),
            }),
            500: t.Object({
              errors: t.Array(t.String()),
            }),
          },
          detail: {
            summary: "Register a new user",
            description:
              "Creates a new user with first name, last name, email and password. Returns the created user (without password).",
            tags: ["User"],
          },
        }
      )
      .post(
        "/login",
        async ({ body }) => {
          return await loginUser(body);
        },
        {
          body: t.Object({
            email: t.String({ format: "email", example: "joao@example.com" }),
            password: t.String({ example: "12345678" }),
          }),
          response: {
            200: t.Object({
              token: t.String({ example: "jwt.token.here" }),
              user: t.Object({
                id: t.Number(),
                email: t.String(),
                firstName: t.String(),
                lastName: t.String(),
              }),
            }),
            401: t.Object({
              messages: t.Array(t.String()),
            }),
            500: t.Object({
              messages: t.Array(t.String()),
            }),
          },
          detail: {
            summary: "Login a user",
            description:
              "Authenticate a user with email and password. Returns a JWT token if successful.",
            tags: ["User"],
          },
        }
      )
  );
