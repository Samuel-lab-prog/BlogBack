import { AppError } from '../utils/AppError.ts';
import { type postType } from './postTypes.ts';
import {
  insertPost,
  insertTagsIntoPost,
  selectPosts,
  selectPostBySlugRaw,
  selectPostBySlug,
  selectTags,
  deletePostById,
  deleteOrphanTags,
} from './postModel.ts';
import slugify from 'slugify';

export async function registerPost(body: Omit<postType, 'id' | 'createdAt' | 'updatedAt' | 'slug'>): Promise<postType> {
  const { title, tags = [] } = body;

  const slug = slugify(title, { lower: true, strict: true });
  const existing = await selectPostBySlugRaw(slug);
  if (existing) {
    throw new AppError({
      statusCode: 409,
      errorMessages: ['Slug already in use'],
    });
  }
  const postData = { ...body, slug };
  const post = await insertPost(postData);

  const safeTags = tags.filter((t) => typeof t === 'string' && t.trim() !== '');
  if (safeTags.length > 0) {
    await insertTagsIntoPost(post.id, safeTags);
  }
  return post;
}

export async function listPosts(limit: number, tag: string | null): Promise<Omit<postType, 'content' | 'authorId'>[]> {
  return await selectPosts(limit, tag);
}

export async function getPostBySlug(slug: string): Promise<postType> {
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
  return await selectTags();
}

export async function excludePostById(id: number): Promise<boolean> {
  const success = await deletePostById(id);
  const tagsDeleted = await deleteOrphanTags();
  return Boolean(success) && Boolean(tagsDeleted);
}
