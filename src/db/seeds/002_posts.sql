CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  excerpt TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  author_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO posts (title, excerpt, slug, content, author_id) VALUES
('First Post', 'This is the excerpt for the first post.', 'first-post', 'This is the full content of the first post.', 1)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO posts (title, excerpt, slug, content, author_id) VALUES
('Second Post', 'This is the excerpt for the second post.', 'second-post', 'This is the full content of the second post.', 2)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO posts (title, excerpt, slug, content, author_id) VALUES
('Third Post', 'This is the excerpt for the third post.', 'third-post', 'This is the full content of the third post.', 3)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO posts (title, excerpt, slug, content, author_id) VALUES
('Fourth Post', 'This is the excerpt for the fourth post.', 'fourth-post', 'This is the full content of the fourth post.', 4)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO posts (title, excerpt, slug, content, author_id) VALUES
('Fifth Post', 'This is the excerpt for the fifth post.', 'fifth-post', 'This is the full content of the fifth post.', 5)
ON CONFLICT (slug) DO NOTHING;