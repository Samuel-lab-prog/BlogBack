import { describe, test, expect, beforeAll } from 'bun:test';
import { insertUser, selectUserByEmail, selectUserById, selectIsAdmin } from './userModel';
import pool from '../db/pool';

const testEmail = 'davidsmith@example.com';
const testPassword = 'securepassword';
const testFirstName = 'David';
const testLastName = 'Smith';
let testUserId: number;

beforeAll(async () => {
  await pool.query(`TRUNCATE TABLE users RESTART IDENTITY CASCADE;`);

  const userData = {
    firstName: testFirstName,
    lastName: testLastName,
    email: testEmail,
    password: testPassword,
  };

  const insertedUser = await insertUser(userData);
  testUserId = insertedUser.id;
});

describe('User model tests', () => {
  test('Insert new user correctly', async () => {
    const user = {
      firstName: 'Alice',
      lastName: 'Brown',
      email: 'alice@example.com',
      password: 'secret',
    };
    const inserted = await insertUser(user);
    expect(inserted).toEqual({
      id: expect.any(Number),
    });
  });

  test('Insert user with existing email', async () => {
    const user = {
      firstName: 'Bob',
      lastName: 'Green',
      email: testEmail,
      password: 'anotherpassword',
    };
    expect(insertUser(user)).rejects.toMatchObject({
      statusCode: 409,
      errorMessages: ['Email already in use'],
    });
  });

  test('Get user by email', async () => {
    const user = await selectUserByEmail(testEmail);
    expect(user).toEqual({
      id: testUserId,
      firstName: testFirstName,
      lastName: testLastName,
      email: testEmail,
      password: 'securepassword',
      isAdmin: false,
    });
  });

  test('Get user by non-existing email', async () => {
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
      password: 'securepassword',
      isAdmin: false,
    });
  });

  test('Get user by non-existing ID', async () => {
    const user = await selectUserById(9999);
    expect(user).toBeNull();
  });

  test('Check if user is admin', async () => {
    const admin = await selectIsAdmin(testUserId);
    expect(admin).toBe(false);
  });
});
