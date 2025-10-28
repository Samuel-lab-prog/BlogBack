import Elysia from "elysia";
import { openapi } from "@elysiajs/openapi";
import { userRoutes } from "./users/userRoute";
import { AppError } from "./utils/appError";

const app = new Elysia()
  .use(openapi({ 
    path: "/docs",
  }))
  .use(userRoutes)
  .onError(({ error, set }) => {
  if (error instanceof AppError) {
    set.status = error.statusCode;
    return { messages: error.messages || [error.message] };
  }
  set.status = 500;
  return { messages: ["Erro interno do servidor"] };
})
 export default app;

