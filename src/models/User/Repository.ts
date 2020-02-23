import { User } from "./Model";
import { IUser } from "./Interface";
import { UserNotFound } from "./Errors";

export const UserRepository = {
  create: (attributes: IUser) => User.create(attributes),
  findByEmail: async (email: string) => {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new UserNotFound(email);

    return user;
  }
};
