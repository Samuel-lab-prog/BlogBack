import { AppError } from "../utils/AppError.ts";
import {
  createPost,
  addTagsToPost,
  findAllPosts,
  findPostBySlug,
  findPostsByTag,
  findPostBySlugRaw,
} from "./postModel.ts";
import slugify from "slugify";

type PostBody = {
  title: string;
  content: string;
  authorId: number;
  tags?: string[];
  status?: "draft" | "published";
};


export async function registerPost(body: PostBody) {
  const { title, content, authorId, tags = [], status = "draft" } = body;

  if (!title || !content || !authorId) {
    throw new AppError({
      statusCode: 400,
      messages: ["Missing required fields (title, content, authorId)"],
    });
  }

  const slug = slugify(title, { lower: true, strict: true });

  // ✅ Verifica se já existe post com o mesmo slug antes de criar
  const existing = await findPostBySlugRaw(slug);
  if (existing) {
    throw new AppError({
      statusCode: 409,
      messages: ["Slug already in use"],
    });
  }

  const post = await createPost(title, slug, content, authorId, status);

  // ✅ Só adiciona tags se existirem
  const safeTags = tags.filter((t) => typeof t === "string" && t.trim() !== "");
  if (safeTags.length > 0) {
    await addTagsToPost(post.id, safeTags);
  }

  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    content: post.content,
    authorId: post.author_id,
    status: post.status,
    createdAt: post.created_at.toISOString(),
    updatedAt: post.updated_at.toISOString(),
    tags: safeTags,
  };
}

export async function listPosts() {
  return await findAllPosts();
}

export async function getPostBySlug(slug: string) {
  try {
    const post = await findPostBySlug(slug);
    return post;
  } catch (err) {
    if (err instanceof AppError) throw err;

    console.error(err);
    throw new AppError({
      statusCode: 500,
      messages: ['Failed to fetch post'],
    });
  }
}

export async function listPostsByTag(tagName: string) {
  if (!tagName) {
    throw new AppError({
      statusCode: 400,
      messages: ["Missing tag name parameter"],
    });
  }

  return await findPostsByTag(tagName);
}
