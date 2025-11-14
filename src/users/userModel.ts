import pool from '../db/pool.ts';
import { DatabaseError } from 'pg';
import { AppError } from '../utils/AppError.ts';
import { type UserRow, type User } from './userTypes.ts';

const isProd = process.env.NODE_ENV === 'production';

function mapUserRow(row: UserRow): User {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    isAdmin: row.is_admin,
    password: row.password_hash,
  };
}
export async function insertUser(
  userData: Omit<User, 'id' | 'isAdmin'>
): Promise<Pick<User, 'id'>> {
  const { firstName, lastName, email, password } = userData;
  const query = `
    INSERT INTO users (first_name, last_name, email, password_hash)
    VALUES ($1, $2, $3, $4)
    RETURNING id
  `;
  try {
    const { rows } = await pool.query(query, [
      firstName,
      lastName,
      email,
      password,
    ]);
    return { id: rows[0].id };
  } catch (error: unknown) {
    if (error instanceof DatabaseError && error.code === '23505') {
      throw new AppError({
        statusCode: 409,
        errorMessages: ['Email already in use'],
        originalError: error,
      });
    }
    throw new AppError({
      statusCode: 500,
      errorMessages: ['Database internal error while creating user'],
      originalError: error as Error,
    });
  }
}
export async function selectUserByEmail(email: string): Promise<User | null> {
  const query = `
    SELECT id, email, name, password, created_at, updated_at
    FROM users
    WHERE email = $1
    LIMIT 2
  `;
  try {
    const { rows } = await pool.query<UserRow>(query, [email]);
    if (!rows[0]) {
      return null;
    }
    if (rows.length > 1) {
      throw new AppError({
        statusCode: 500,
        errorMessages: ['Duplicate users with same email detected'],
      });
    }
    return mapUserRow(rows[0]);
  } catch (error: unknown) {
    if (error instanceof AppError) throw error;

    throw new AppError({
      statusCode: 500,
      errorMessages: ['Database internal error while fetching user by email'],
      originalError: isProd ? undefined : (error as Error),
    });
  }
}



export async function selectUserById(id: number): Promise<User> {
  const query = `
    SELECT *
    FROM users
    WHERE id = $1
  `;
  try {
    const { rows } = await pool.query<UserRow>(query, [id]);
    if (!rows[0]){
      throw new AppError({
        statusCode: 404,
        errorMessages: ['User not found'],
      });
    }
    return mapUserRow(rows[0]);
  } catch (error: unknown) {
    throw new AppError({
      statusCode: 500,
      errorMessages: ['Database internal error while fetching user by ID'],
      originalError: error as Error,
    });
  }
}

export async function selectIsAdmin(userId: number): Promise<boolean> {
  const query = `
    SELECT is_admin
    FROM users
    WHERE id = $1
  `;

  try {
    const { rows } = await pool.query(query, [userId]);
    if (!rows[0]){
      throw new AppError({
        statusCode: 404,
        errorMessages: ['User not found'],
      });
    }
    return rows[0].is_admin;
  } catch (error: unknown) {
    throw new AppError({
      statusCode: 500,
      errorMessages: ['Database internal error while fetching user role'],
      originalError: error as Error,
    });
  }
}
