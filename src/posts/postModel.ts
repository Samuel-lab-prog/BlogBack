import { DatabaseError } from 'pg';
import { AppError } from '../utils/AppError.ts';
import pool from '../db/pool.ts';
import type {
  postRowType,
  postType,
  insertPostType,
} from '../utils/types.ts';

function mapPostRow(row: postRowType): postType {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    authorId: Number(row.author_id),
    status: row.status,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(
      row.updated_at ?? row.created_at
    ).toISOString(),
    tags: Array.isArray(row.tags)
      ? row.tags.filter((t): t is string => !!t)
      : [],
  };
}

export async function createPost(
  postData: insertPostType
): Promise<postType> {
  const query = `
    INSERT INTO posts (title, slug, content, author_id, status)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  try {
    const { title, slug, content, authorId, status } = postData;
    const { rows } = await pool.query(query, [
      title,
      slug,
      content,
      authorId,
      status,
    ]);

    if (!rows[0]) {
      throw new AppError({
        statusCode: 500,
        messages: ['Failed to create post.'],
      });
    }

    return mapPostRow(rows[0]);
  } catch (error: unknown) {
    if (error instanceof DatabaseError && error.code === '23505') {
      throw new AppError({
        statusCode: 409,
        messages: ['Slug already in use'],
      });
    }
    console.error(error);
    throw new AppError({
      statusCode: 500,
      messages: ['Database internal error while creating post.'],
    });
  }
}

export async function addTagsToPost(
  postId: number,
  tagNames: string[]
): Promise<number> {
  if (tagNames.length === 0) return 0;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const uniqueTags = [
      ...new Set(tagNames.map((t) => t.trim().toLowerCase())),
    ];
    await client.query(
      `
      INSERT INTO tags (name)
      SELECT UNNEST($1::text[])
      ON CONFLICT (name) DO NOTHING
      `,
      [uniqueTags]
    );
    const { rows: tagRows } = await client.query(
      `SELECT id FROM tags WHERE name = ANY($1)`,
      [uniqueTags]
    );
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
      messages: ['Failed to associate tags to post'],
    });
  } finally {
    client.release();
  }
}
export async function findPostBySlugRaw(
  slug: string
): Promise<number | null> {
  const query = `SELECT id FROM posts WHERE slug = $1 LIMIT 1`;
  const { rows } = await pool.query(query, [slug]);
  return rows[0]?.id || null;
}

export async function findAllPosts(): Promise<postType[]> {
  const query = `
    SELECT 
      p.id, p.title, p.slug, p.content, p.status, p.author_id,
      p.created_at, p.updated_at,
      json_agg(t.name) FILTER (WHERE t.name IS NOT NULL) AS tags
    FROM posts p
    LEFT JOIN post_tags pt ON p.id = pt.post_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `;
  try {
    const { rows } = await pool.query(query);
    return rows.map((row) => mapPostRow(row));
  } catch (error) {
    console.error(error);
    throw new AppError({
      statusCode: 500,
      messages: ['Database internal error while listing posts'],
    });
  }
}

export async function findPostsByTag(
  tagName: string
): Promise<postType[]> {
  try {
    const query = `
      SELECT 
        p.id, p.title, p.slug, p.content, p.status, p.created_at,
        p.updated_at, p.author_id,
        json_agg(t.name) FILTER (WHERE t.name IS NOT NULL) AS tags
      FROM posts p
      JOIN post_tags pt ON p.id = pt.post_id
      JOIN tags t ON pt.tag_id = t.id
      WHERE t.name = $1
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `;
    const { rows } = await pool.query(query, [tagName]);
    return rows.map((row) => mapPostRow(row));
  } catch (error) {
    console.error(error);
    throw new AppError({
      statusCode: 500,
      messages: [
        'Database internal error while listing posts by tag',
      ],
    });
  }
}
