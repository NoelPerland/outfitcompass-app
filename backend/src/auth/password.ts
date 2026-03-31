import bcrypt from "bcryptjs";

const rounds = 10;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, rounds);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}
