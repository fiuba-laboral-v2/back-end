import { nonNull, String } from "../fieldTypes";
import { IUser } from "../../models/User";
import { UserRepository } from "../../models/User/Repository";
import { JWT } from "../../JWT";
import { UserInputError } from "apollo-server-errors";

export const userMutations = {
  login: {
    type: String,
    args: {
      email: {
        type: nonNull(String)
      },
      password: {
        type: nonNull(String)
      }
    },
    resolve: async (_: undefined, { email, password }: IUser) => {
      const user = await UserRepository.findByEmail(email);
      const valid = await user.passwordMatches(password);
      if (!valid) throw new UserInputError("Incorrect password");

      return JWT.createToken(user);
    }
  }
};
