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
            email: t.String({ format: "email", example: "joao@example.com" }),
            password: t.String({ minLength: 6, example: "12345678" }),
            firstName: t.String({ minLength: 3, example: "João" }),
            lastName: t.String({ minLength: 3, example: "Silva" }),
          }),

          response: {
            201: t.Object({
              id: t.Number(),
              email: t.String(),
              firstName: t.String(),
              lastName: t.String(),
            }),
            400: t.Object({
              message: t.String(),
            }),
            500: t.Object({
              message: t.String(),
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
        async ({ body, set }) => {
          try {
            const token = await loginUser(body);
            return token;
          } catch (err: any) {
            console.error("Login error:", err);
            set.status = err.statusCode || 401;
            return { message: err.message || "Credenciais inválidas" };
          }
        },
        {
          body: t.Object({
            email: t.String({ format: "email", example: "joao@example.com" }),
            password: t.String({ example: "12345678" }),
          }),

          response: {
            200: t.Object({
              token: t.String({ example: "jwt.token.here" }),
            }),
            401: t.Object({
              message: t.String(),
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
