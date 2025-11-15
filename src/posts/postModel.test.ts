/* import { describe, test, expect, beforeAll } from 'bun:test';
import pool from '../db/pool';
import {
  insertPost,
  insertTagsIntoPost,
  selectPosts,
  selectPostBySlug,
  selectAllUniqueTags,
  deletePostBySlug,
  deleteOrphanTags,
  deleteTagsFromPost,
  updatePostBySlug,
} from './postModel';
import { insertUser } from '../users/userModel';

const testData = {
  post: {
    title: 'Test Post',
    slug: 'test-post',
    excerpt: 'This is a test excerpt.',
    content: 'This is the content of the test post.',
  },
  tags: ['TestTag', 'SampleTag'],
  user: {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    password: 'hashedpwd',
  },
};

let testUserId: number;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let testPostId: any;

beforeAll(async () => {
  await pool.query(`
    TRUNCATE TABLE post_tags, tags, posts, users 
    RESTART IDENTITY CASCADE;
  `);

  const insertedUser = await insertUser(testData.user);
  testUserId = insertedUser.id;

  const insertedPost = await insertPost({
    ...testData.post,
    authorId: testUserId,
  });

  testPostId = insertedPost;

  await insertTagsIntoPost(testPostId, testData.tags);
});

describe('Post model tests', () => {
  test('Insert new post correctly', async () => {
    const inserted = await insertPost({
      title: 'Another Post',
      slug: 'another-post',
      content: 'Some content',
      authorId: testUserId,
      excerpt: 'Excerpt example',
    });

    expect(inserted).toBeGreaterThan(0);
  });

  test('Insert post with existing slug should throw conflict error', async () => {
    expect(
      insertPost({
        title: 'Duplicate',
        slug: testData.post.slug,
        content: 'Duplicate content',
        authorId: testUserId,
        excerpt: 'Duplicate',
      })
    ).rejects.toMatchObject({
      statusCode: 409,
      errorMessages: ['Slug already in use'],
    });
  });

  test('Insert tags into post', async () => {
    const count = await insertTagsIntoPost(testPostId, ['ExtraTag']);
    expect(count).toBeGreaterThan(0);
  });

  test('Select posts without tag filter', async () => {
    const posts = await selectPosts(10, null);

    expect(Array.isArray(posts)).toBe(true);
    expect(posts.length).toBeGreaterThan(0);
    expect(posts[0]).toHaveProperty('title');
    expect(posts[0]).toHaveProperty('slug');
    expect(posts[0]).toHaveProperty('tags');
  });

  test('Select posts with tag filter', async () => {
    const posts = await selectPosts(10, 'SampleTag');

    expect(Array.isArray(posts)).toBe(true);
    if (posts.length) {
      expect(posts[0]?.tags).toContain('SampleTag');
    }
  });

  test('Select post by slug', async () => {
    const post = await selectPostBySlug(testData.post.slug);
    expect(post).not.toBeNull();
    expect(post).toMatchObject({
      title: testData.post.title,
      slug: testData.post.slug,
      excerpt: testData.post.excerpt,
    });
  });

  test('Select post by non-existing slug returns null', async () => {
    const post = await selectPostBySlug('does-not-exist');
    expect(post).toBeNull();
  });

  test('Select all unique tags', async () => {
    const tags = await selectAllUniqueTags();
    expect(Array.isArray(tags)).toBe(true);
    expect(tags.length).toBeGreaterThan(0);
    expect(tags).toContain('TestTag');
  });

  test('Update post by slug returns updated id', async () => {
    const updatedId = await updatePostBySlug(testData.post.slug, {
      title: 'Updated Title',
    });

    expect(updatedId).toBe(testPostId);
  });

  test('Delete tags from post returns number of rows deleted', async () => {
    const deleted = await deleteTagsFromPost(testPostId);
    expect(typeof deleted).toBe('number');
    expect(deleted).toBeGreaterThanOrEqual(2);
  });

  test('Delete orphan tags returns count of deleted tags', async () => {
    const deleted = await deleteOrphanTags();
    expect(typeof deleted).toBe('number');
  });

  test('Delete post by slug returns id', async () => {
    const deletedId = await deletePostBySlug(testData.post.slug);
    expect(deletedId).toBe(testPostId);
  });

  test('Deleting non-existing post returns 0', async () => {
    const deleted = await deletePostBySlug('does-not-exist');
    expect(deleted).toBe(0);
  });
});
 */