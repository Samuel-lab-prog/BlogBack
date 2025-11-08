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

export async function registerPost(
  body: Omit<postType, 'id' | 'createdAt' | 'updatedAt' | 'slug'>
): Promise<postType> {

  const { title, tags = [] } = body;
  const slug = slugify(title, { lower: true, strict: true });
  const existing = await selectPostBySlug(slug);
  if (existing) {
    throw new AppError({
      statusCode: 409,
      errorMessages: ['Slug already in use'],
    });
  }

  const postData = { ...body, slug, };
  const post = await insertPost(postData);

  const safeTags = tags.filter((t) => typeof t === 'string' && t.trim());
  if (safeTags.length) {
    await insertTagsIntoPost(post.id, safeTags);
  }

  return post;
}

export async function listPosts(
  limit: number,
  tag: string | null
): Promise<Omit<postType, 'content' | 'authorId'>[]> {
  return selectPosts(limit, tag);
}

export async function getPostByTitle(title: string): Promise<Omit<postType, 'authorId' | 'id'>> {
  const slug = slugify(title, { lower: true, strict: true });
  const post = await selectPostBySlug(slug);
  if (!post) {
    throw new AppError({
      statusCode: 404,
      errorMessages: ['Post not found'],
    });
  }
  return post;
}

export async function fetchTags(): Promise<string[]> {
  return selectAllUniqueTags();
}

export async function excludePostByTitle(title: string): Promise<boolean> {
  const slug = slugify(title, { lower: true, strict: true });
  const post = await selectPostBySlug(slug);
  if (!post) {
    throw new AppError({
      statusCode: 404,
      errorMessages: ['Post not found'],
    });
  }
  const result = await deletePostBySlug(slug);
  await deleteOrphanTags();
  return result;
}

export async function refreshPostByTitle(
  title: string,
  newData: Partial<Omit<postType, 'id' | 'createdAt' | 'updatedAt' | 'authorId'>>
): Promise<boolean> {

  const slug = slugify(title, { lower: true, strict: true });
  const post = await selectPostBySlug(slug);
  if (!post) {
    throw new AppError({
      statusCode: 404,
      errorMessages: ['Post not found'],
    });
  }

  if (Object.keys(newData).length === 0) {
    throw new AppError({
      statusCode: 400,
      errorMessages: ['No data provided for update'],
    });
  }

  if (newData.title) {
    const newSlug = slugify(newData.title, { lower: true, strict: true });
    newData.slug = newSlug;

    const existing = await selectPostBySlug(newSlug);
    if (existing && existing.id !== post.id) {
      throw new AppError({
        statusCode: 409,
        errorMessages: ['Slug already in use'],
      });
    }
  }

  if (newData.tags) {
    const safeTags = newData.tags.filter((t) => typeof t === 'string' && t.trim());
    await deleteTagsFromPost(post.id);
    if (safeTags.length) {
      await insertTagsIntoPost(post.id, safeTags);
    }
    await deleteOrphanTags();
    delete newData.tags;
  }

  return updatePostBySlug(post.slug, newData);
}
