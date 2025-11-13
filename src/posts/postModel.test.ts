import { describe, test, expect, beforeAll } from "bun:test";
import pool from "../db/pool";
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
} from "./postModel";

const testPost = {
  title: "My First Post",
  slug: "my-first-post",
  content: "This is the content of the first post.",
  authorId: 1,
  excerpt: "My first post excerpt.",
};

let testPostId: number;

beforeAll(async () => {
  await pool.query(`
    TRUNCATE TABLE post_tags, tags, posts RESTART IDENTITY CASCADE;
  `);

  const inserted = await insertPost(testPost);
  testPostId = inserted.id;
});

describe("Post model tests", () => {
  test("Insert new post correctly", async () => {
    const post = {
      title: "Another Post",
      slug: "another-post",
      content: "Some content",
      authorId: 1,
      excerpt: "Excerpt example",
    };
    const inserted = await insertPost(post);
    expect(inserted).toEqual({
      id: expect.any(Number),
    });
  });

  test("Insert post with existing slug", async () => {
    const post = {
      title: "Duplicate Post",
      slug: testPost.slug, // mesmo slug
      content: "Duplicate content",
      authorId: 1,
      excerpt: "Duplicate",
    };
    await expect(insertPost(post)).rejects.toMatchObject({
      statusCode: 409,
      errorMessages: ["Slug already in use"],
    });
  });

  test("Insert tags into post", async () => {
    const tagCount = await insertTagsIntoPost(testPostId, ["tech", "bun", "javascript"]);
    expect(tagCount).toBeGreaterThan(0);
  });

  test("Select posts without tag filter", async () => {
    const posts = await selectPosts(10, null);
    expect(Array.isArray(posts)).toBe(true);
    expect(posts[0]).toHaveProperty("title");
    expect(posts[0]).toHaveProperty("slug");
    expect(posts[0]).toHaveProperty("tags");
  });

  test("Select posts with tag filter", async () => {
    const posts = await selectPosts(10, "tech");
    expect(Array.isArray(posts)).toBe(true);
    if (posts.length) {
      expect(posts[0].tags).toContain("tech");
    }
  });

  test("Select post by slug", async () => {
    const post = await selectPostBySlug(testPost.slug);
    expect(post).toMatchObject({
      title: testPost.title,
      slug: testPost.slug,
      excerpt: testPost.excerpt,
    });
  });

  test("Select post by non-existing slug", async () => {
    const post = await selectPostBySlug("nonexistent-slug");
    expect(post).toBeNull();
  });

  test("Select all unique tags", async () => {
    const tags = await selectAllUniqueTags();
    expect(Array.isArray(tags)).toBe(true);
    expect(tags.length).toBeGreaterThan(0);
  });

  test("Update post by slug", async () => {
    const updated = await updatePostBySlug(testPost.slug, { title: "Updated Title" });
    expect(updated).toBe(true);
  });

  test("Delete tags from post", async () => {
    const deleted = await deleteTagsFromPost(testPostId);
    expect(deleted).toBe(true);
  });

  test("Delete orphan tags", async () => {
    const deleted = await deleteOrphanTags();
    expect(typeof deleted).toBe("boolean");
  });

  test("Delete post by slug", async () => {
    const deleted = await deletePostBySlug(testPost.slug);
    expect(deleted).toBe(true);
  });

  test("Delete non-existing post", async () => {
    const deleted = await deletePostBySlug("does-not-exist");
    expect(deleted).toBe(false);
  });
});
