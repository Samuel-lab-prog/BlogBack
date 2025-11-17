import pool from '../db/pool.ts';
import { DatabaseError } from 'pg';
import { AppError } from '../utils/AppError.ts';
import { type UserWithPasswordHash, type User, type NewUser } from './userTypes.ts';

const isProd = process.env.NODE_ENV === 'production';

export async function insertUser(userData: NewUser): Promise<Pick<User, 'id'>> {
  const { firstName, lastName, email, password } = userData;
  const query = `
    INSERT INTO users (first_name, last_name, email, password_hash)
    VALUES ($1, $2, $3, $4)
    RETURNING id
  `;
  try {
    const { rows } = await pool.query(query, [firstName, lastName, email, password]);

    if (!rows[0]) {
      throw new AppError({
        statusCode: 500,
        errorMessages: ['Failed to create user: no userId returned from database'],
      });
    }

    return { id: rows[0].id };
  } catch (error: unknown) {
    if (error instanceof DatabaseError && error.code === '23505') {
      throw new AppError({
        statusCode: 409,
        errorMessages: ['Email already in use'],
      });
    }
    if (error instanceof AppError) throw error;

    throw new AppError({
      statusCode: 500,
      errorMessages: ['Database internal error while creating user'],
      originalError: isProd ? undefined : (error as Error),
    });
  }
}

export async function selectUserByEmail(email: string): Promise<UserWithPasswordHash | null> {
  const query = `
    SELECT id, email, first_name, last_name, is_admin, password_hash
    FROM users
    WHERE email = $1
    LIMIT 2
  `;

  try {
    const { rows } = await pool.query(query, [email]);

    if (!rows[0]) return null;

    if (rows.length > 1) {
      throw new AppError({
        statusCode: 500,
        errorMessages: ['Duplicate users with same email detected'],
      });
    }

    return {
      id: rows[0].id,
      email: rows[0].email,
      firstName: rows[0].first_name,
      lastName: rows[0].last_name,
      isAdmin: rows[0].is_admin,
      passwordHash: rows[0].password_hash,
    };
  } catch (error: unknown) {
    if (error instanceof AppError) throw error;

    throw new AppError({
      statusCode: 500,
      errorMessages: ['Database internal error while fetching user by email'],
      originalError: isProd ? undefined : (error as Error),
    });
  }
}

export async function selectUserById(id: number): Promise<User | null> {
  const query = `
    SELECT id, email, first_name, last_name, is_admin
    FROM users
    WHERE id = $1
  `;

  try {
    const { rows } = await pool.query(query, [id]);

    if (!rows[0]) return null;

    return {
      id: rows[0].id,
      email: rows[0].email,
      firstName: rows[0].first_name,
      lastName: rows[0].last_name,
      isAdmin: rows[0].is_admin,
    };
  } catch (error: unknown) {
    throw new AppError({
      statusCode: 500,
      errorMessages: ['Database internal error while fetching user by ID'],
      originalError: isProd ? undefined : (error as Error),
    });
  }
}
