import { describe, test, expect, beforeAll } from 'bun:test';
import { loginUser, registerUser, authenticateUser } from './userController';
import pool from '../db/pool';

const testEmail = 'amyrose@example.com';
const testPassword = 'securepassword';
const testFirstName = 'Amy';
const testLastName = 'Rose';
let testUserId: number;

beforeAll(async () => {
  await pool.query(`TRUNCATE TABLE users RESTART IDENTITY CASCADE;`);

  const userData = {
    firstName: testFirstName,
    lastName: testLastName,
    email: testEmail,
    password: testPassword,
  };

  const insertedUser = await registerUser(userData);
  testUserId = insertedUser.id;
});

describe('User controller test', () => {
  test('Register new user', async () => {
    const newUser = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@example.com',
      password: 'anothersecurepassword',
    };

    const result = await registerUser(newUser);
    expect(result).toHaveProperty('id');
    expect(typeof result.id).toBe('number');
  });

  test('Login with valid credentials', async () => {
    const loginData = {
      email: testEmail,
      password: testPassword,
    };
    const result = await loginUser(loginData);
    expect(result).toHaveProperty('token');
    expect(typeof result.token).toBe('string');
  });

  test('Login with invalid credentials', async () => {
    const loginData = {
      email: testEmail,
      password: 'wrongpassword',
    };
    expect(loginUser(loginData)).rejects.toThrow('Invalid credentials');
  });

  test('Authenticate user with valid token', async () => {
    const loginData = {
      email: testEmail,
      password: testPassword,
    };
    const { token } = await loginUser(loginData);
    const authResult = await authenticateUser(token);
    expect(authResult).toEqual({
      id: testUserId,
      isAdmin: false,
    });
  });

  test('Authenticate user with invalid token', async () => {
    const invalidToken = 'invalid.token.here';
    expect(authenticateUser(invalidToken)).rejects.toThrow('User not found');
  });
});
