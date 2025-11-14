import { describe, test, expect, beforeAll } from 'bun:test';
import { insertUser, selectUserByEmail, selectUserById, selectIsAdmin } from './userModel';
import pool from '../db/pool';

const testEmail = 'davidsmith@example.com';
const testPassword = 'securepassword';
const testFirstName = 'David';
const testLastName = 'Smith';
const testUserId = 1; // Assuming this will be the first inserted user and gets ID 1
const testIsAdmin = false; // Default value for new users

beforeAll(async () => {
  await pool.query(`TRUNCATE TABLE users RESTART IDENTITY CASCADE;`);
  const userData = {
    firstName: testFirstName,
    lastName: testLastName,
    email: testEmail,
    password: testPassword,
  };
  await insertUser(userData);
});

describe('User model tests', () => {
  test('Insert new user', async () => {
    const user = {
      firstName: 'Alice',
      lastName: 'Brown',
      email: 'alice@example.com',
      password: 'secret',
    };
    const inserted = await insertUser(user);
    expect(inserted).toEqual({
      id: 2,
    });
  });

  test('Insert new user with existing email', async () => {
    const user = {
      firstName: 'Bob',
      lastName: 'Green',
      email: testEmail,
      password: 'anotherpassword',
    };
    expect(insertUser(user)).rejects.toBeTruthy();
  });

  test('Get user by email', async () => {
    const user = await selectUserByEmail(testEmail);
    expect(user).toEqual({
      id: testUserId,
      firstName: testFirstName,
      lastName: testLastName,
      email: testEmail,
      password: testPassword,
      isAdmin: testIsAdmin,
    });
  });

  test('Get user by non-existing email', async () => {
    expect(selectUserByEmail('nonexistent@example.com')).rejects.toBeTruthy();
  });

  test('Get user by ID', async () => {
    const user = await selectUserById(testUserId);
    expect(user).toEqual({
      id: testUserId,
      firstName: testFirstName,
      lastName: testLastName,
      email: testEmail,
      password: testPassword,
      isAdmin: testIsAdmin,
    });
  });

  test('Get user by non-existing ID', async () => {
    expect(selectUserById(9999)).rejects.toBeTruthy();
  });

  test('Check if user is admin', async () => {
    const admin = await selectIsAdmin(testUserId);
    expect(admin).toBe(testIsAdmin);
  });
  test('Check if non-existing user is admin', async () => {
    expect(selectIsAdmin(9999)).rejects.toBeTruthy();
  });
});
