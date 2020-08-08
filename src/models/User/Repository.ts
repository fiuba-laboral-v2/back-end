import { ICreateFiubaUser, IUser, IUserEditable } from "./Interface";
import { UserNotFoundError } from "./Errors";
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
    if (!isFiubaUser) throw new Error(`The user with DNI: ${dni} does not exist as a Fiuba user`);
    return User.create({ dni, ...attributes }, { transaction });
  },
  validateCredentials: async (user: User, password: string) => {
    // TODO: Esto es temporal. En el próximo pr la idea es loguear al usuario de
    //  FIUBA con dni y mejorar el código y testearlo
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
    if (!user) throw new UserNotFoundError(email);

    return user;
  },
  update: (user: User, newAttributes: IUserEditable, transaction?: Transaction) => {
    return user.update(newAttributes, { transaction });
  },
  truncate: () => User.truncate({ cascade: true })
};
