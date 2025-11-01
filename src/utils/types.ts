export type errorsType = {
  statusCode: number;
  messages?: string[];
};

// Users types
export type userRowType = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
};

export type userType = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
};

export type createUserInsertType = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type createUserBodyType = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

// Posts types
export type postRowType = {
  id: number;
  title: string;
  slug: string;
  content: string;
  author_id: number;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
  tags: string[];
};

export type postType = {
  id: number;
  title: string;
  slug: string;
  content: string;
  authorId: number;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
  tags: string[];
};

export type insertPostType = {
  title: string;
  slug: string;
  content: string;
  authorId: number;
  status: 'draft' | 'published';
};

export type postBodyType = {
  title: string;
  content: string;
  authorId: number;
  tags?: string[];
  status?: 'draft' | 'published';
};
