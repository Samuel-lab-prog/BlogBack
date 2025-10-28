import { AppError } from "../utils/appError";
import { createUser, findUserByEmail, validatePassword } from "./userModel";
import { generateToken } from "../utils/jwt";

type userBody = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};
export async function registerUser(body: userBody) {
  const { firstName, lastName, email, password } = body;
  if (!firstName || !lastName || !email || !password)
    throw new AppError({ statusCode: 400, messages: ["All fields are required"] });

  const user = await createUser(String(firstName), String(lastName), String(email), String(password));
  return { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name };
}

export async function loginUser(body: { email: string; password: string }) {
  const { email, password } = body;
  if (!email || !password)
    throw new AppError({ statusCode: 400, messages: ["Email and password are required"] });

  const user = await findUserByEmail(email);
  if (!user)
    throw new AppError({ statusCode: 401, messages: ["Invalid credentials"] });

  const valid = await validatePassword(user, password);
  if (!valid)
    throw new AppError({ statusCode: 401, messages: ["Invalid credentials"] });

  const token = generateToken({ id: user.id, email: user.email });
  return { token, user: { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name } };
}
