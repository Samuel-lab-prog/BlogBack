import { AppError } from '../utils/AppError.ts';
import { type postType } from './postTypes.ts';
import {
  insertPost,
  insertTagsIntoPost,
  selectPosts,
  selectPostBySlug,
  selectAllUniqueTags,
  deletePostBySlug,
  deleteOrphanTags,
  updatePostBySlug,
  deleteTagsFromPost,
} from './postModel.ts';
import slugify from 'slugify';

function normalizeTag(tag: string): string {
  return tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase();
}

function normalizeTags(tags: string[] | undefined): string[] {
  return (tags ?? [])
    .filter((t) => typeof t === 'string' && t.trim().length > 0)
    .map((tag) => normalizeTag(tag));
}

async function ensurePostExists(slug: string) {
  const post = await selectPostBySlug(slug);
  if (!post) {
    throw new AppError({
      statusCode: 404,
      errorMessages: ['Post not found'],
    });
  }
  return post;
}

export async function registerPost(
  body: Omit<postType, 'id' | 'createdAt' | 'updatedAt' | 'slug'>
): Promise<Pick<postType, 'id'>> {
  const slug = slugify(body.title, { lower: true, strict: true });

  const safeTags = normalizeTags(body.tags);

  const post = await insertPost({ ...body, slug });

  if (safeTags.length) {
    await insertTagsIntoPost(post.id, safeTags);
  }

  return post;
}

export async function listPosts(
  limit: number,
  tag: string | null
): Promise<Omit<postType, 'content' | 'authorId' | 'id'>[]> {
  return selectPosts(limit, tag);
}

export async function getPostByTitle(title: string) {
  const slug = slugify(title, { lower: true, strict: true });
  return ensurePostExists(slug);
}

export async function fetchTags() {
  return selectAllUniqueTags();
}

export async function excludePostByTitle(title: string) {
  const slug = slugify(title, { lower: true, strict: true });
  await ensurePostExists(slug);

  const deleted = await deletePostBySlug(slug);
  await deleteOrphanTags();

  return deleted;
}

export async function refreshPostByTitle(
  title: string,
  newData: Partial<Omit<postType, 'id' | 'createdAt' | 'updatedAt' | 'authorId'>>
) {
  if (!Object.keys(newData).length) {
    throw new AppError({
      statusCode: 400,
      errorMessages: ['No data provided for update'],
    });
  }

  const slug = slugify(title, { lower: true, strict: true });
  const existingPost = await ensurePostExists(slug);

  const updates: Record<string, unknown> = {};

  if (newData.title) {
    const newSlug = slugify(newData.title, { lower: true, strict: true });
    const conflict = await selectPostBySlug(newSlug);

    if (conflict && conflict.id !== existingPost.id) {
      throw new AppError({
        statusCode: 409,
        errorMessages: ['Slug already in use'],
      });
    }

    updates.title = newData.title;
    updates.slug = newSlug;
  }

  if (newData.content !== undefined) {
    updates.content = newData.content;
  }

  if (newData.tags) {
    const safeTags = normalizeTags(newData.tags);

    await deleteTagsFromPost(existingPost.id);

    if (safeTags.length) {
      await insertTagsIntoPost(existingPost.id, safeTags);
    }

    await deleteOrphanTags();
  }

  if (!Object.keys(updates).length) {
    return existingPost;
  }

  return updatePostBySlug(existingPost.slug, updates);
}
