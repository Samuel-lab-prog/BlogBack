import Elysia from "elysia";
import { openapi } from "@elysiajs/openapi";
import type AppErrorType from "./utils/AppError";
import AppError from "./utils/AppError";

const app = new Elysia()
    .get("/", () => {"Hello, Bun! 🐰";
        
    })
    .onError(({ error }) => {
        const err = error as AppErrorType;
        return { errors: err?.errors, message: err.message, statusCode: err.statusCode };
    })
    .use(openapi())
export default app;