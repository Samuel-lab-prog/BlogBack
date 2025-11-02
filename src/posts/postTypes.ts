export type postRowType = {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author_id: number;
  created_at: string;
  updated_at: string;
  tags: string[];
};

export type postType = {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  authorId: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
};

export type insertPostType = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  authorId: number;
};

export type postBodyType = {
  title: string;
  content: string;
  excerpt: string;
  authorId: number;
  tags: string[];
};
