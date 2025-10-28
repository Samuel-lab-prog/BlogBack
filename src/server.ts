import Elysia from "elysia";
import { openapi } from "@elysiajs/openapi";
import { userRoutes } from "./users/userRoute";
import { AppError } from "./utils/AppError";

const app = new Elysia()
  .onError(({ error }) => {
    return new Response(JSON.stringify({
      errors: error instanceof AppError ? error.messages : error,
    }), {
      status: error instanceof AppError ? error.statusCode : 500,
      headers: { "Content-Type": "application/json" },
    });
  })
  .use(
    openapi({
      path: "/docs",
    })
  )
  .use(userRoutes)
  .listen({ port: Number(process.env.PORT) || 3000 });


export default app;
