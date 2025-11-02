import { AppError } from '../utils/AppError.ts';
import { type postBodyType, type postType } from './postTypes.ts';
import {
  createPost,
  addTagsToPost,
  findAllPosts,
  findPostsByTag,
  findPostBySlugRaw,
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

export async function listPosts() {
  return await findAllPosts();
}

export async function listPostsByTag(tagName: string) {
  if (!tagName) {
    throw new AppError({
      statusCode: 400,
      errorMessages: ['Missing tag name parameter'],
    });
  }

  return await findPostsByTag(tagName);
}
