import { DatabaseError } from 'pg';
import { AppError } from '../utils/AppError.ts';
import pool from '../db/pool.ts';
import type { postType, newPost } from './postTypes.ts';

const isProd = process.env.NODE_ENV === 'production';

export async function insertPost(postData: newPost): Promise<Pick<postType, 'id'>> {
  const { title, slug, content, authorId, excerpt } = postData;

  const query = `
    INSERT INTO posts (title, slug, content, author_id, excerpt)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
  `;

  try {
    const { rows } = await pool.query(query, [title, slug, content, authorId, excerpt]);

    if (!rows[0]?.id) {
      throw new AppError({
        statusCode: 500,
        errorMessages: ['Failed to create post: no post returned from database'],
      });
    }

    return { id: rows[0].id };
  } catch (error: unknown) {
    if (error instanceof AppError) throw error;

    if (error instanceof DatabaseError && error.code === '23505') {
      throw new AppError({
        statusCode: 409,
        errorMessages: ['Slug already in use'],
      });
    }

    throw new AppError({
      statusCode: 500,
      errorMessages: ['Failed to create post: an unexpected error occurred'],
      originalError: isProd ? undefined : (error as Error),
    });
  }
}

export async function insertTagsIntoPost(postId: number, tagNames: string[]): Promise<number> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query(
      `
      INSERT INTO tags (name)
      SELECT UNNEST($1::text[])
      ON CONFLICT (name) DO NOTHING
      `,
      [tagNames]
    );

    const { rows: tagRows } = await client.query(
      `
      SELECT id, name
      FROM tags
      WHERE name = ANY($1)
      ORDER BY array_position($1, name)
      `,
      [tagNames]
    );

    const tagIds = tagRows.map((t) => t.id);

    if (tagIds.length > 0) {
      await client.query(
        `
        INSERT INTO post_tags (post_id, tag_id)
        SELECT $1, UNNEST($2::int[])
        ON CONFLICT (post_id, tag_id) DO NOTHING
        `,
        [postId, tagIds]
      );
    }

    await client.query('COMMIT');
    return tagIds.length;
  } catch (error) {
    await client.query('ROLLBACK');
    throw new AppError({
      statusCode: 500,
      errorMessages: ['Failed to associate tags to post'],
      originalError: error as Error,
    });
  } finally {
    client.release();
  }
}

export async function selectPosts(
  limit: number,
  tag: string | null
): Promise<Omit<postType, 'content' | 'authorId' | 'id'>[]> {
  const query = `
    SELECT 
      p.title,
      p.slug,
      p.created_at,
      p.updated_at,
      p.excerpt,
      COALESCE(
        json_agg(t.name ORDER BY t.name) FILTER (WHERE t.name IS NOT NULL),
        '[]'
      ) AS tags
    FROM posts p
    LEFT JOIN post_tags pt ON p.id = pt.post_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    ${tag ? 'WHERE t.name = $2' : ''}
    GROUP BY p.id
    ORDER BY p.created_at DESC
    LIMIT $1
  `;

  try {
    const params = tag ? [limit, tag] : [limit];
    const { rows } = await pool.query(query, params);

    return rows.map((row) => ({
      title: row.title,
      slug: row.slug,
      createdAt: row.created_at.toString(),
      updatedAt: row.updated_at.toString(),
      excerpt: row.excerpt,
      tags: row.tags,
    }));
  } catch (error) {
    throw new AppError({
      statusCode: 500,
      errorMessages: ['Failed to select posts'],
      originalError: error as Error,
    });
  }
}

export async function selectPostBySlug(slug: string): Promise<postType | null> {
  const query = `
    SELECT 
      p.id, p.title, p.author_id, p.slug, p.content,
      p.created_at, p.updated_at, p.excerpt,
      COALESCE(
        json_agg(t.name ORDER BY t.name)
        FILTER (WHERE t.name IS NOT NULL),
        '[]'
      ) AS tags
    FROM posts p
    LEFT JOIN post_tags pt ON p.id = pt.post_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    WHERE p.slug = $1
    GROUP BY p.id
    LIMIT 1
  `;

  const { rows } = await pool.query(query, [slug]);

  if (!rows[0]) return null;

  return {
    id: rows[0].id,
    title: rows[0].title,
    authorId: rows[0].author_id,
    slug: rows[0].slug,
    content: rows[0].content,
    createdAt: rows[0].created_at.toString(),
    updatedAt: rows[0].updated_at.toString(),
    excerpt: rows[0].excerpt,
    tags: rows[0].tags,
  };
}

export async function selectAllUniqueTags(): Promise<string[]> {
  const query = `SELECT DISTINCT name FROM tags ORDER BY name ASC`;

  try {
    const { rows } = await pool.query(query);
    return rows.map((row) => row.name);
  } catch (error) {
    throw new AppError({
      statusCode: 500,
      errorMessages: ['Failed to select tags'],
      originalError: error as Error,
    });
  }
}

export async function deletePostBySlug(slug: string): Promise<number> {
  const query = `DELETE FROM posts WHERE slug = $1 RETURNING id`;

  try {
    const { rows } = await pool.query(query, [slug]);
    return rows[0]?.id ?? 0;
  } catch (error) {
    throw new AppError({
      statusCode: 500,
      errorMessages: ['Failed to delete post'],
      originalError: error as Error,
    });
  }
}

export async function deleteOrphanTags(): Promise<number> {
  try {
    const { rowCount } = await pool.query(`
      DELETE FROM tags
      WHERE id NOT IN (
        SELECT DISTINCT tag_id FROM post_tags
      )
    `);
    return rowCount ?? 0;
  } catch (error) {
    throw new AppError({
      statusCode: 500,
      errorMessages: ['Failed to delete orphan tags'],
      originalError: error as Error,
    });
  }
}

export async function deleteTagsFromPost(postId: number): Promise<number> {
  try {
    const { rowCount } = await pool.query(`DELETE FROM post_tags WHERE post_id = $1`, [postId]);
    return rowCount ?? 0;
  } catch (error) {
    throw new AppError({
      statusCode: 500,
      errorMessages: ['Failed to delete tags from post'],
      originalError: error as Error,
    });
  }
}

const camelToSnake = (str: string): string => str.replace(/([A-Z])/g, '_$1').toLowerCase();

export async function updatePostBySlug(
  slug: string,
  newData: Partial<Omit<postType, 'id' | 'createdAt' | 'updatedAt' | 'authorId'>>
): Promise<number> {
  const entries = Object.entries(newData);
  if (entries.length === 0) return 0;

  const fields = entries.map(([key], i) => `${camelToSnake(key)} = $${i + 1}`);

  const values = entries.map(([, v]) => v);

  fields.push(`updated_at = NOW()`);

  const query = `
    UPDATE posts
    SET ${fields.join(', ')}
    WHERE slug = $${values.length + 1}
    RETURNING id
  `;

  try {
    const { rows } = await pool.query(query, [...values, slug]);
    return rows[0]?.id ?? 0;
  } catch (error) {
    throw new AppError({
      statusCode: 500,
      errorMessages: ['Failed to update post'],
      originalError: error as Error,
    });
  }
}
