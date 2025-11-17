import { describe, test, expect, beforeAll } from 'bun:test';
import { insertUser, selectUserByEmail, selectUserById } from './userModel';
import pool from '../db/pool';
import { AppError } from '../utils/AppError';

const testEmail = 'davidsmith@example.com';
const testPasswordHash = 'hash123';
const testFirstName = 'David';
const testLastName = 'Smith';
const testUserId = 1;
const testIsAdmin = false;

beforeAll(async () => {
  await pool.query(`TRUNCATE TABLE users RESTART IDENTITY CASCADE;`);

  await insertUser({
    firstName: testFirstName,
    lastName: testLastName,
    email: testEmail,
    password: testPasswordHash,
  });
});

describe('User model tests', () => {
  test('Insert new user', async () => {
    const inserted = await insertUser({
      firstName: 'Alice',
      lastName: 'Brown',
      email: 'alice@example.com',
      password: 'hash456',
    });

    expect(inserted).toEqual({ id: 2 });
  });

  test('Insert new user with existing email → should throw AppError 409', async () => {
    const duplicated = insertUser({
      firstName: 'Bob',
      lastName: 'Green',
      email: testEmail,
      password: 'irrelevantHash',
    });

    expect(duplicated).rejects.toBeInstanceOf(AppError);
  });

  test('Get user by email', async () => {
    const user = await selectUserByEmail(testEmail);

    expect(user).toEqual({
      id: testUserId,
      firstName: testFirstName,
      lastName: testLastName,
      email: testEmail,
      passwordHash: testPasswordHash,
      isAdmin: testIsAdmin,
    });
  });

  test('Get user by non-existing email → should return null', async () => {
    const user = await selectUserByEmail('nonexistent@example.com');
    expect(user).toBeNull();
  });

  test('Get user by ID', async () => {
    const user = await selectUserById(testUserId);

    expect(user).toEqual({
      id: testUserId,
      firstName: testFirstName,
      lastName: testLastName,
      email: testEmail,
      isAdmin: testIsAdmin,
    });
  });

  test('Get user by non-existing ID → should return null', async () => {
    const user = await selectUserById(9999);
    expect(user).toBeNull();
  });
});
