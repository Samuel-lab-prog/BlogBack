import pool from "../db/pool.ts";
import { AppError } from "../utils/AppError.ts";


function mapPostRow(row: any) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    authorId: row.author_id ?? 0, // garante number
    status: row.status,
    createdAt: new Date(row.created_at ?? Date.now()).toISOString(),
    updatedAt: new Date(row.updated_at ?? row.created_at ?? Date.now()).toISOString(),
    tags: row.tags ?? [],
  };
}



export async function createPost(
  title: string,
  slug: string,
  content: string,
  authorId: number,
  status: "draft" | "published" = "draft"
) {
  const query = `
    INSERT INTO posts (title, slug, content, author_id, status)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, title, slug, content, author_id, status, created_at, updated_at
  `;

  try {
    const { rows } = await pool.query(query, [
      title,
      slug,
      content,
      authorId,
      status,
    ]);
    return rows[0];
  } catch (error: any) {
    if (error.code === "23505") {
      throw new AppError({
        statusCode: 409,
        messages: ["Slug already in use"],
      });
    }
    console.error(error);
    throw new AppError({
      statusCode: 500,
      messages: ["Database internal error while creating post"],
    });
  }
}

export async function addTagsToPost(postId: number, tagNames: string[]) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const uniqueTags = [...new Set(tagNames.map(t => t.trim().toLowerCase()))];
    await client.query(
      `
      INSERT INTO tags (name)
      SELECT UNNEST($1::text[])
      ON CONFLICT (name) DO NOTHING
      `,
      [uniqueTags]
    );

    // Busca IDs das tags
    const { rows: tagRows } = await client.query(
      `SELECT id FROM tags WHERE name = ANY($1)`,
      [uniqueTags]
    );
    const tagIds = tagRows.map((t) => t.id);

    // Associa tags ao post
    if (tagIds.length > 0) {
      const linkValues = tagIds.map((_, i) => `($1, $${i + 2})`).join(",");
      await client.query(
        `
        INSERT INTO post_tags (post_id, tag_id)
        VALUES ${linkValues}
        ON CONFLICT DO NOTHING
        `,
        [postId, ...tagIds]
      );
    }

    await client.query("COMMIT");
    return tagIds.length;
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    throw new AppError({
      statusCode: 500,
      messages: ["Failed to associate tags to post"],
    });
  } finally {
    client.release();
  }
}

// Busca simples sem join (para validação de slug)
export async function findPostBySlugRaw(slug: string) {
  const query = `SELECT id FROM posts WHERE slug = $1 LIMIT 1`;
  const { rows } = await pool.query(query, [slug]);
  return rows[0] || null;
}

export async function findPostBySlug(slug: string) {
  const query = `
    SELECT 
      p.id, p.title, p.slug, p.content, p.status, p.created_at, p.updated_at, p.author_id,
      json_agg(t.name) FILTER (WHERE t.name IS NOT NULL) AS tags
    FROM posts p
    LEFT JOIN post_tags pt ON p.id = pt.post_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    WHERE p.slug = $1
    GROUP BY p.id
  `;
  const { rows } = await pool.query(query, [slug]);
  return rows[0] ? mapPostRow(rows[0]) : null;
}

export async function findAllPosts() {
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
      messages: ["Database internal error while listing posts"],
    });
  }
}


export async function findPostsByTag(tagName: string) {
  const query = `
    SELECT 
      p.id, p.title, p.slug, p.content, p.status, p.created_at,
      json_agg(t.name) FILTER (WHERE t.name IS NOT NULL) AS tags
    FROM posts p
    JOIN post_tags pt ON p.id = pt.post_id
    JOIN tags t ON pt.tag_id = t.id
    WHERE t.name = $1
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `;
  const { rows } = await pool.query(query, [tagName]);
  return rows;
}
