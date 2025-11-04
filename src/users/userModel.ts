import pool from '../db/pool.ts';
import { DatabaseError } from 'pg';
import { AppError } from '../utils/AppError.ts';
import { type UserRow, type User } from './userTypes.ts';

function mapUserRow(row: UserRow): Omit<User, 'password'> {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    isAdmin: row.is_admin,
  };
}
 
export async function createUser(userData: Omit<User, 'id' | 'isAdmin'>): Promise<Omit<User, 'password'>> {
  const { firstName, lastName, email, password } = userData;
  const query = `
    INSERT INTO users (first_name, last_name, email, password_hash)
    VALUES ($1, $2, $3, $4)
    RETURNING id, email, first_name, last_name, is_admin
  `;
  try {
    const { rows } = await pool.query(query, [firstName, lastName, email, password]);
    return mapUserRow(rows[0]);
  } catch (error: unknown) {
    if (error instanceof DatabaseError && error.code === '23505') {
      throw new AppError({
        statusCode: 409,
        errorMessages: ['Email already in use'],
      });
    }
    throw new AppError({
      statusCode: 500,
      errorMessages: ['Database internal error while creating user: ' + (error as Error).message],
    });
  }
}

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const query = `
    SELECT *
    FROM users
    WHERE email = $1
  `;
  try {
    const { rows } = await pool.query(query, [email]);
    return rows[0] || null;
  } catch (error: unknown) {
    throw new AppError({
      statusCode: 500,
      errorMessages: ['Database internal error while getting user by email: ' + (error as Error).message],
    });
  }
}

export async function findUserById(id: number): Promise<User | null> {
  const query = `
    SELECT *
    FROM users
    WHERE id = $1
  `;

  try {
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  } catch (error: unknown) {
    console.error(error);
    throw new AppError({
      statusCode: 500,
      errorMessages: ['Database internal error while fetching user by ID: ' + (error as Error).message],
    });
  }
}

export async function isAdmin(userId: number): Promise<boolean> {
  const query = `
    SELECT is_admin
    FROM users
    WHERE id = $1
  `;
  try {
    const { rows } = await pool.query(query, [userId]);
    if (!rows[0]) return false;
    return rows[0].is_admin;
  } catch (error: unknown) {
    throw new AppError({
      statusCode: 500,
      errorMessages: [
        'Database internal error while fetching user role: ' + (error as Error).message,
      ],
    });
  }
}

