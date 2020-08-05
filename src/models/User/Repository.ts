import { IUser, IUserEditable } from "./Interface";
import { UserNotFoundError } from "./Errors";
import { Transaction } from "sequelize/types";
import { User } from "$models";

export const UserRepository = {
  create: (attributes: IUser, transaction?: Transaction) =>
    User.create(attributes, { transaction }),
  findByEmail: async (email: string) => {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new UserNotFoundError(email);

    return user;
  },
  update: (user: User, newAttributes: IUserEditable, transaction?: Transaction) => {
    return user.update(newAttributes, { transaction });
  },
  truncate: () => User.truncate({ cascade: true })
};
