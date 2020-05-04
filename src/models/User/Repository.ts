import { User } from "./Model";
import { IUser, IUserEditable } from "./Interface";
import { UserNotFoundError } from "./Errors";
import { Transaction } from "sequelize/types";

export const UserRepository = {
  create: (attributes: IUser, transaction?: Transaction) =>
    User.create(attributes, { transaction }),
  findByEmail: async (email: string) => {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new UserNotFoundError(email);

    return user;
  },
  update: async (user: User, newAttributes: IUserEditable, transaction?: Transaction) => {
    await user.set(newAttributes);
    return user.save({ transaction });
  },
  truncate: () => User.truncate({ cascade: true })
};
