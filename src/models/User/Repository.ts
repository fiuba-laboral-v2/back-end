import { ICreateFiubaUser, IUser, IUserEditable } from "./Interface";
import { FiubaUserNotFoundError, UserNotFoundError } from "./Errors";
import { Transaction } from "sequelize/types";
import { FiubaUsersService } from "$services";
import { User } from "$models";

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
  findByEmail: async (email: string) => {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new UserNotFoundError({ email });

    return user;
  },
  findByDni: async (dni: string) => {
    const user = await User.findOne({ where: { dni } });
    if (!user) throw new UserNotFoundError({ dni });

    return user;
  },
  findByUuid: async (uuid: string) => {
    const user = await User.findByPk(uuid);
    if (!user) throw new UserNotFoundError({ uuid });

    return user;
  },
  findByUuids: (uuids: string[]) => User.findAll({ where: { uuid: uuids } }),
  update: (user: User, newAttributes: IUserEditable, transaction?: Transaction) =>
    user.update(newAttributes, { transaction }),
  truncate: () => User.truncate({ cascade: true })
};
