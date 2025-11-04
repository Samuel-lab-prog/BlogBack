import bcrypt from 'bcryptjs';
import pool from '../db/pool.ts';
import { DatabaseError } from 'pg';
import { AppError } from '../utils/AppError.ts';
import { type userRowType, type userType, type createUserInsertType } from './userTypes.ts';

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10;

function mapUserRow(row: userRowType): userType {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
  };
}

export async function createUser(userData: createUserInsertType): Promise<userType> {
  const { firstName, lastName, email, password } = userData;
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const query = `
    INSERT INTO users (first_name, last_name, email, password_hash)
    VALUES ($1, $2, $3, $4)
    RETURNING id, email, first_name, last_name
  `;

  try {
    const { rows } = await pool.query(query, [firstName, lastName, email, hashedPassword]);

    if (!rows[0]) {
      throw new AppError({
        statusCode: 500,
        errorMessages: ['Unexpected error: user not returned after creation'],
      });
    }

    return mapUserRow(rows[0]);
  } catch (error: unknown) {
    if (error instanceof DatabaseError && error.code === '23505') {
      throw new AppError({
        statusCode: 409,
        errorMessages: ['Email already in use'],
      });
    }

    console.error(error);
    throw new AppError({
      statusCode: 500,
      errorMessages: ['Database internal error while creating user'],
    });
  }
}

export async function findUserByEmail(email: string): Promise<userRowType | null> {
  const query = `
    SELECT id, first_name, last_name, email, password_hash
    FROM users
    WHERE email = $1
  `;

  try {
    const { rows } = await pool.query(query, [email]);
    return rows[0] || null;
  } catch (error: unknown) {
    console.error(error);
    throw new AppError({
      statusCode: 500,
      errorMessages: ['Database internal error while fetching user by email'],
    });
  }
}

export async function validatePassword(
  user: Pick<userRowType, 'password_hash'>,
  password: string
): Promise<boolean> {
  if (!user.password_hash) return false;
  return bcrypt.compare(password, user.password_hash);
}
