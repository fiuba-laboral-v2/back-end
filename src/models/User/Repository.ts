import { ICreateFiubaUser, IUser, IUserEditable } from "./Interface";
import { FiubaUserNotFoundError, UserNotFoundError } from "./Errors";
import { Transaction } from "sequelize/types";
import { FiubaUsersService } from "$services";
import { UserSequelizeModel } from "$models";

export const UserRepository = {
  create: (attributes: IUser, transaction?: Transaction) =>
    UserSequelizeModel.create(attributes, { transaction }),
  createFiubaUser: async (
    { dni, password, ...attributes }: ICreateFiubaUser,
    transaction?: Transaction
  ) => {
    const isFiubaUser = await FiubaUsersService.authenticate({ dni, password });
    if (!isFiubaUser) throw new FiubaUserNotFoundError(dni);
    return UserSequelizeModel.create({ dni, ...attributes }, { transaction });
  },
  findByEmail: async (email: string) => {
    const user = await UserSequelizeModel.findOne({ where: { email } });
    if (!user) throw new UserNotFoundError({ email });

    return user;
  },
  findByDni: async (dni: string) => {
    const user = await UserSequelizeModel.findOne({ where: { dni } });
    if (!user) throw new UserNotFoundError({ dni });

    return user;
  },
  findByUuid: async (uuid: string) => {
    const user = await UserSequelizeModel.findByPk(uuid);
    if (!user) throw new UserNotFoundError({ uuid });

    return user;
  },
  findByUuids: (uuids: string[]) => UserSequelizeModel.findAll({ where: { uuid: uuids } }),
  update: (user: UserSequelizeModel, newAttributes: IUserEditable, transaction?: Transaction) =>
    user.update(newAttributes, { transaction }),
  truncate: () => UserSequelizeModel.truncate({ cascade: true })
};
