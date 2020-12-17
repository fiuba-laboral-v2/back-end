import { compare, hashSync } from "bcrypt";

const bcryptSaltOrRounds = 10;

export const PasswordEncryptor = {
  encrypt: (password: string) => hashSync(password, bcryptSaltOrRounds),
  passwordMatches: (password: string, hashedPassword: string) => compare(password, hashedPassword)
};
