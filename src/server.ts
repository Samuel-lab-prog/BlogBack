import Elysia from "elysia";
import { openapi } from "@elysiajs/openapi";
import cors from "@elysiajs/cors";

import { userRoutes } from "./users/userRoute";
import { postRoutes } from "./posts/postRoutes"; 
import { AppError } from "./utils/AppError";

const app = new Elysia()
  .use(cors())
  .use(
    openapi({
      path: "/docs",
    })
  )
  .onError(({ error }) => {
    if (error instanceof AppError) {
      return new Response(
        JSON.stringify({
          messages: error.messages,
          statusCode: error.statusCode,
        }),
        {
          status: error.statusCode,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    return new Response(
      JSON.stringify({
        messages: ["Internal server error"],
        statusCode: 500,
        error: error,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  })
  .use(userRoutes)
  .use(postRoutes)  
  .listen({ port: Number(process.env.PORT) || 3000 });

console.log(`🚀 Server running on port ${Number(process.env.PORT) || 3000}`);

export default app;
