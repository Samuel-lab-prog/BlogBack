import { DatabaseError } from 'pg';
import { AppError } from '../utils/AppError.ts';
import pool from '../db/pool.ts';
import type { postRowType, postType } from './postTypes.ts';

function mapPostRow(row: postRowType): postType {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    authorId: Number(row.author_id),
    excerpt: row.excerpt,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at ?? row.created_at).toISOString(),
    tags: Array.isArray(row.tags) ? row.tags.filter((t): t is string => !!t) : [],
  };
}

export async function insertPost(
  postData: Omit<postType, 'id' | 'createdAt' | 'updatedAt'>
): Promise<postType> {
  const query = `
    INSERT INTO posts (title, slug, content, author_id, excerpt)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  try {
    const { title, slug, content, authorId, excerpt } = postData;
    const { rows } = await pool.query(query, [title, slug, content, authorId, excerpt]);

    if (!rows[0]) {
      throw new AppError({
        statusCode: 500,
        errorMessages: ['Failed to create post.'],
      });
    }

    return mapPostRow(rows[0]);
  } catch (error: unknown) {
    if (error instanceof DatabaseError && error.code === '23505') {
      throw new AppError({
        statusCode: 409,
        errorMessages: ['Slug already in use'],
      });
    }
    throw new AppError({
      statusCode: 500,
      errorMessages: ['Database internal error while creating post.'],
    });
  }
}

export async function insertTagsIntoPost(postId: number, tagNames: string[]): Promise<number> {
  if (tagNames.length === 0) return 0;
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
    const { rows: tagRows } = await client.query(`SELECT id FROM tags WHERE name = ANY($1)`, [
      tagNames,
    ]);
    const tagIds = tagRows.map((t) => t.id);

    if (tagIds.length > 0) {
      await client.query(
        `
        INSERT INTO post_tags (post_id, tag_id)
        SELECT $1, UNNEST($2::int[])
        ON CONFLICT DO NOTHING
        `,
        [postId, tagIds]
      );
    }

    await client.query('COMMIT');
    return tagIds.length;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    throw new AppError({
      statusCode: 500,
      errorMessages: ['Failed to associate tags to post ' + error],
    });
  } finally {
    client.release();
  }
}
export async function selectPostBySlugRaw(slug: string): Promise<number | null> {
  const query = `SELECT id FROM posts WHERE slug = $1 LIMIT 1`;
  const { rows } = await pool.query(query, [slug]);
  return rows[0]?.id || null;
}

export async function selectPosts(limit: number, tag: string | null): Promise<postType[]> {
  const query = `
    SELECT 
      p.title, p.slug, p.id,
      p.created_at, p.updated_at, p.excerpt,
      json_agg(t.name) FILTER (WHERE t.name IS NOT NULL) AS tags
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
    return rows.map((row) => mapPostRow(row));
  } catch (error) {
    throw new AppError({
      statusCode: 500,
      errorMessages: ['Database internal error while listing posts: ' + error],
    });
  }
}

export async function selectPostBySlug(slug: string): Promise<postType | null> {
  const query = `
    SELECT 
      p.id, p.title, p.slug, p.content, p.author_id,
      p.created_at, p.updated_at, p.excerpt,
      json_agg(t.name) FILTER (WHERE t.name IS NOT NULL) AS tags
    FROM posts p
    LEFT JOIN post_tags pt ON p.id = pt.post_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    WHERE p.slug = $1
    GROUP BY p.id
    LIMIT 1
  `;
  const { rows } = await pool.query(query, [slug]);
  return rows[0] ? mapPostRow(rows[0]) : null;
}

export async function selectTags(): Promise<string[]> {
  const query = `SELECT DISTINCT name FROM tags ORDER BY name ASC`;
  const { rows } = await pool.query(query);
  return rows.map((row) => row.name);
}

export async function deletePostById(id: number): Promise<number | null> {
  const query = `DELETE FROM posts WHERE id = $1`;
  try {
    const { rowCount } = await pool.query(query, [id]);
    return rowCount;
  } catch (error) {
    throw new AppError({
      statusCode: 500,
      errorMessages: ['Failed to delete post:' + error],
    });
  }
}
export async function deleteOrphanTags(): Promise<number | null> {
  try {
    const query = `
      DELETE FROM tags
      WHERE id NOT IN (SELECT DISTINCT tag_id FROM post_tags)
    `;
    const { rowCount } = await pool.query(query);
    return rowCount;
  } catch (error) {
    throw new AppError({
      statusCode: 500,
      errorMessages: ['Failed to delete orphan tags:' + error],
    });
  }
}
export async function deleteTagsFromPost(postId: number): Promise<number | null> {
  try {
    const query = `
      DELETE FROM post_tags
      WHERE post_id = $1
    `;
    const { rowCount } = await pool.query(query, [postId]);
    return rowCount;
  } catch (error) {
    throw new AppError({
      statusCode: 500,
      errorMessages: ['Failed to delete tags from post:' + error],
    });
  }
}
export async function updatePostById(
  id: number,
  newData: Partial<Omit<postType, 'id' | 'createdAt' | 'updatedAt' | 'authorId'>>
): Promise<postType | null> {
  const fields = [];
  const values = [];
  let index = 1;
  for (const [key, value] of Object.entries(newData)) {
    fields.push(`${key} = $${index}`);
    values.push(value);
    index++;
  }
  fields.push(`updated_at = NOW()`);
  try {
    const query = `
      UPDATE posts
      SET ${fields.join(', ')}
      WHERE id = $${index}
      RETURNING *
    `;
    const { rows } = await pool.query(query, [...values, id]);
    return mapPostRow(rows[0]);
  } catch (error) {
    throw new AppError({
      statusCode: 500,
      errorMessages: ['Failed to update post:' + error],
    });
  }
}
