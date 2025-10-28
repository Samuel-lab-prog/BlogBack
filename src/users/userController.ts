import { AppError } from "../utils/AppError";
import { createUser, findUserByEmail, validatePassword } from "./userModel";
import { generateToken } from "../utils/jwt";

type UserBody = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export async function registerUser(body: UserBody) {
  const { firstName, lastName, email, password } = body;

  const user = await createUser(
    String(firstName),
    String(lastName),
    String(email),
    String(password)
  );

  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
  };
}

export async function loginUser(body: { email: string; password: string }) {
  const { email, password } = body;

  const user = await findUserByEmail(email);
  if (!user)
    throw new AppError({ statusCode: 401, messages: ["Invalid credentials"] });

  const valid = await validatePassword(user, password);
  if (!valid)
    throw new AppError({ statusCode: 401, messages: ["Invalid credentials"] });

  const token = generateToken({ id: user.id, email: user.email });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
    },
  };
}
