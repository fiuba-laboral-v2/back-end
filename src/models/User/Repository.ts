import { IUser, IUserEditable } from "./Interface";
import { UserNotFoundError, MissingDniError } from "./Errors";
import { Transaction } from "sequelize/types";
import { FiubaUsersService } from "$services";
import { User } from "$models";
import { BadCredentialsError } from "$graphql/User/Errors";

export const UserRepository = {
  create: (attributes: IUser, transaction?: Transaction) =>
    User.create(attributes, { transaction }),
  createFiubaUser: async (
    {
      dni,
      password,
      ...attributes
    }: IUser,
    transaction?: Transaction
  ) => {
    if (!dni) throw new MissingDniError();
    if (!password) throw new Error("Password must be given to authenticate");

    const isFiubaUser = await FiubaUsersService.authenticate({ dni, password });
    if (!isFiubaUser) throw new Error(`The user with DNI: ${dni} does not exist as a Fiuba user`);

    return User.create(
      {
        dni,
        ...attributes
      },
      { transaction }
      );
  },
  validateFiubaUserCredentials: async (user: User, password: string) => {
    const valid = FiubaUsersService.authenticate({ dni: user.dni, password });
    if (!valid) throw new BadCredentialsError();
  },
  validateCredentials: async (user: User, password: string) => {
    if (await user.isFiubaUser()) {
      return UserRepository.validateFiubaUserCredentials(user, password);
    }
    const valid = await user.passwordMatches(password);
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
