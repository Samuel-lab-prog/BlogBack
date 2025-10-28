import bcrypt from "bcryptjs";
import pool from "../db/pool.ts";
import { AppError } from "../utils/appError.ts";

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10;

export async function createUser(
  firstName: string,
  lastName: string,
  email: string,
  password: string
) {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const query = `
    INSERT INTO users (id, first_name, last_name, email, password_hash)
    VALUES (default, $1, $2, $3, $4)
    RETURNING id, email, first_name, last_name
  `;
  try {
    const { rows } = await pool.query(query, [firstName, lastName, email, hashedPassword]);
    return rows[0];
  } catch (error: any) {
    if (error.code === "23505") {
      throw new AppError({ statusCode: 400, messages: ["Email already exists"] });
    }
    throw new AppError({ statusCode: 500, messages: ["Database internal error"] });
  }
}

export async function findUserByEmail(email: string) {
  try {
    const query = `SELECT id, first_name, last_name, email FROM users WHERE email = $1`;
    const { rows } = await pool.query(query, [email]);
    return rows[0] || null;
  } catch (error: any) {
    throw new AppError({ statusCode: 500, messages: ["Database internal error"] });
  }
}
export async function validatePassword(user: { password_hash: string }, password: string) {
  return bcrypt.compare(password, user.password_hash);
}

