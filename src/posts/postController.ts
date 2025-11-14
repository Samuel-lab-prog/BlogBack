import { AppError } from '../utils/AppError.ts'
import { type postType } from './postTypes.ts'
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
} from './postModel.ts'
import slugify from 'slugify'

function normalizeTag(tag: string): string {
  return tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase()
}

function normalizeTags(tags: string[] | undefined): string[] {
  return (tags ?? [])
    .filter((t) => typeof t === 'string' && t.trim())
    .map((tag) => normalizeTag(tag))
}

async function ensurePostExists(slug: string) {
  const post = await selectPostBySlug(slug)
  if (!post) {
    throw new AppError({
      statusCode: 404,
      errorMessages: ['Post not found'],
    })
  }
  return post
}

export async function registerPost(
  body: Omit<postType, 'id' | 'createdAt' | 'updatedAt' | 'slug'>
): Promise<Pick<postType, 'id'>> {
  const slug = slugify(body.title, { lower: true, strict: true })

  if (await selectPostBySlug(slug)) {
    throw new AppError({
      statusCode: 409,
      errorMessages: ['Slug already in use'],
    })
  }

  const post = await insertPost({ ...body, slug })

  const safeTags = normalizeTags(body.tags)
  if (safeTags.length) {
    await insertTagsIntoPost(post.id, safeTags)
  }

  return post
}

export async function listPosts(
  limit: number,
  tag: string | null
): Promise<Omit<postType, 'content' | 'authorId' | 'id'>[]> {
  return selectPosts(limit, tag)
}

export async function getPostByTitle(title: string) {
  const slug = slugify(title, { lower: true, strict: true })
  return await ensurePostExists(slug)
}

export async function fetchTags() {
  return selectAllUniqueTags()
}

export async function excludePostByTitle(title: string) {
  const slug = slugify(title, { lower: true, strict: true })
  await ensurePostExists(slug)

  const deleted = await deletePostBySlug(slug)
  await deleteOrphanTags()
  return deleted
}

export async function refreshPostByTitle(
  title: string,
  newData: Partial<Omit<postType, 'id' | 'createdAt' | 'updatedAt' | 'authorId'>>
) {
  if (!Object.keys(newData).length) {
    throw new AppError({ statusCode: 400, errorMessages: ['No data provided for update'] })
  }

  const slug = slugify(title, { lower: true, strict: true })
  const post = await ensurePostExists(slug)

  if (newData.title) {
    const newSlug = slugify(newData.title, { lower: true, strict: true })
    const existing = await selectPostBySlug(newSlug)

    if (existing && existing.id !== post.id) {
      throw new AppError({ statusCode: 409, errorMessages: ['Slug already in use'] })
    }

    newData.slug = newSlug
  }

  if (newData.tags) {
    const safeTags = normalizeTags(newData.tags)
    await deleteTagsFromPost(post.id)

    if (safeTags.length) await insertTagsIntoPost(post.id, safeTags)

    await deleteOrphanTags()
    delete newData.tags
  }

  return updatePostBySlug(post.slug, newData)
}
