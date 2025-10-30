import { Elysia, t } from "elysia";
import {
  registerPost,
  listPosts,
  getPostBySlug,
  listPostsByTag,
} from "./postController.ts";
import { AppError, errorObject } from "../utils/AppError.ts";
import { retrieveRootParamters } from "elysia/sucrose";

export const postRoutes = (app: Elysia) =>
  app.group("/posts", (app) =>
    app
      // 🟩 Criar post
      .post(
        "/",
        async ({ body, set }) => {
          const post = await registerPost(body);
          set.status = 201;
          return post;
        },
        {
          body: t.Object({
            title: t.String({
              minLength: 3,
              maxLength: 150,
              example: "Como aprender JavaScript",
              error() {
                throw new AppError({
                  messages: [
                    "Invalid title: must be between 3 and 150 characters",
                  ],
                  statusCode: 422,
                });
              },
            }),
            content: t.String({
              minLength: 10,
              example: "Conteúdo do post...",
              error() {
                throw new AppError({
                  messages: ["Content must have at least 10 characters"],
                  statusCode: 422,
                });
              },
            }),
            authorId: t.Number({ example: 1 }),
            tags: t.Optional(t.Array(t.String({ example: "JavaScript" }))),
            status: t.Optional(
              t.Union([t.Literal("draft"), t.Literal("published")])
            ),
          }),
          response: {
            201: t.Object({
              id: t.Number(),
              title: t.String(),
              slug: t.String(),
              content: t.String(),
              authorId: t.Number(),
              status: t.String(),
              createdAt: t.String(),
              updatedAt: t.String(),
              tags: t.Array(t.String()),
            }),
            400: errorObject,
            422: errorObject,
            409: errorObject,
            500: errorObject,
          },
          detail: {
            summary: "Create a new post",
            description:
              "Creates a new post with title, content, authorId and optional tags and status.",
            tags: ["Post"],
          },
        }
      )
      // 🟦 Listar todos os posts
      .get(
        "/",
        async () => listPosts(),
        {
          response: {
            200: t.Array(
              t.Object({
                id: t.Number(),
                title: t.String(),
                slug: t.String(),
                content: t.String(),
                authorId: t.Number(),
                status: t.String(),
                createdAt: t.String(),
                updatedAt: t.String(),
                tags: t.Array(t.String()),
              })
            ),
            500: errorObject,
          },
          detail: {
            summary: "List all posts",
            description: "Returns all posts with their tags.",
            tags: ["Post"],
          },
        }
      )
      // 🟪 Buscar post pelo slug
      .get(
        "/:slug",
        async ({ params }) => { 
            const post = await getPostBySlug(params.slug);
            return post;
         },
        {
          response: {
            200: t.Object({
              id: t.Number(),
              title: t.String(),
              slug: t.String(),
              content: t.String(),
              authorId: t.Number(),
              status: t.String(),
              createdAt: t.String(),
              updatedAt: t.String(),
              tags: t.Array(t.String()),
            }),
            400: errorObject,
            404: errorObject,
            500: errorObject,
          },
          detail: {
            summary: "Get post by slug",
            description: "Fetch a single post by its slug, including tags.",
            tags: ["Post"],
          },
        }
      )
      // 🟧 Listar posts por tag
      .get(
        "/tags/:tag",
        async ({ params }) => listPostsByTag(params.tag),
        {
          response: {
            200: t.Array(
              t.Object({
                id: t.Number(),
                title: t.String(),
                slug: t.String(),
                content: t.String(),
                authorId: t.Number(),
                status: t.String(),
                createdAt: t.String(),
                updatedAt: t.String(),
                tags: t.Array(t.String()),
              })
            ),
            400: errorObject,
            500: errorObject,
          },
          detail: {
            summary: "List posts by tag",
            description: "Fetch all posts associated with a specific tag.",
            tags: ["Post"],
          },
        }
      )
  );
