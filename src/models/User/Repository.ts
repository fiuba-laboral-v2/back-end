import { ICreateFiubaUser, IUser, IUserEditable } from "./Interface";
import { FiubaUserNotFoundError, UserNotFoundError } from "./Errors";
import { Transaction } from "sequelize/types";
import { FiubaUsersService } from "$services";
import { User } from "$models";
import { BadCredentialsError } from "$graphql/User/Errors";

export const UserRepository = {
  create: (attributes: IUser, transaction?: Transaction) =>
    User.create(attributes, { transaction }),
  createFiubaUser: async (
    { dni, password, ...attributes }: ICreateFiubaUser,
    transaction?: Transaction
  ) => {
    const isFiubaUser = await FiubaUsersService.authenticate({ dni, password });
    if (!isFiubaUser) throw new FiubaUserNotFoundError(dni);
    return User.create({ dni, ...attributes }, { transaction });
  },
  validateCredentials: async (user: User, password: string) => {
    let valid;
    if (user.isFiubaUser()) {
      valid = await FiubaUsersService.authenticate({ dni: user.dni, password });
    } else {
      valid = await user.passwordMatches(password);
    }
    if (!valid) throw new BadCredentialsError();
  },
  findByEmail: async (email: string) => {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new UserNotFoundError({ email });

    return user;
  },
  findByUuid: async (uuid: string) => {
    const user = await User.findByPk(uuid);
    if (!user) throw new UserNotFoundError({ uuid });

    return user;
  },
  update: (user: User, newAttributes: IUserEditable, transaction?: Transaction) =>
    user.update(newAttributes, { transaction }),
  truncate: () => User.truncate({ cascade: true })
};
