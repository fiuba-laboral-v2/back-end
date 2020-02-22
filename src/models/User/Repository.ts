import { User } from "./Model";
import { IUser } from "./Interface";

export const UserRepository = {
  create: (attributes: IUser) => User.create(attributes),
  findByEmail: (email: string) => User.findByPk(email)
};
