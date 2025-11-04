import { AppError } from '../utils/AppError.ts';
import { type postBodyType, type postType } from './postTypes.ts';
import {
  createPost,
  addTagsToPost,
  findPosts,
  findPostBySlugRaw,
  findPostBySlug,
  getTags
} from './postModel.ts';
import slugify from 'slugify';

export async function registerPost(
  body: postBodyType
): Promise<postType> {
  const {
    title,
    tags = [],
  } = body;

  const slug = slugify(title, { lower: true, strict: true });
  const existing = await findPostBySlugRaw(slug);
  if (existing) {
    throw new AppError({
      statusCode: 409,
      errorMessages: ['Slug already in use'],
    });
  }
  const postData = { ...body, slug };
  const post = await createPost(postData);

  const safeTags = tags.filter(
    (t) => typeof t === 'string' && t.trim() !== ''
  );
  if (safeTags.length > 0) {
    await addTagsToPost(post.id, safeTags);
  }
  return post;
}

export async function listPosts(limit: number, tag: string | null): Promise<postType[]> {
  return await findPosts(limit, tag);
}

export async function getPostBySlug(slug: string): Promise<postType> {
  const post = await findPostBySlug(slug);
  if (!post) {
    throw new AppError({
      statusCode: 404,
      errorMessages: ['Post not found'],
    });
  }
  return post;
}
export async function fetchTags(): Promise<string[]> {
  return await getTags();
}
