import { Database } from "$config";
import { ISaveAdmin } from "./Interface";
import { UserRepository, User, FiubaUserNotFoundError } from "$models/User";
import { FiubaCredentials } from "$models/User/Credentials";
import { AdminNotFoundError } from "./Errors";
import { Admin } from "..";
import { PaginationQuery } from "../PaginationQuery";
import { IPaginatedInput } from "$src/graphql/Pagination/Types/GraphQLPaginatedInput";

export const AdminRepository = {
  create: ({ user: userAttributes, secretary }: ISaveAdmin) =>
    Database.transaction(async transaction => {
      const credentials = new FiubaCredentials(userAttributes.dni);
      const user = new User({ ...userAttributes, credentials });
      const isValid = await user.credentials.authenticate(userAttributes.password);
      if (!isValid) throw new FiubaUserNotFoundError(credentials.dni);
      await UserRepository.save(user, transaction);
      return Admin.create({ userUuid: user.uuid!, secretary }, { transaction });
    }),
  findByUserUuidIfExits: async (userUuid: string) => Admin.findByPk(userUuid),
  findByUserUuid: async (userUuid: string) => {
    const admin = await Admin.findByPk(userUuid);
    if (!admin) throw new AdminNotFoundError(userUuid);

    return admin;
  },
  findAll: () => Admin.findAll(),
  findLatest: (updatedBeforeThan?: IPaginatedInput) =>
    PaginationQuery.findLatest({
      updatedBeforeThan,
      query: options => Admin.findAll(options),
      uuidKey: "userUuid",
      order: [
        ["updatedAt", "DESC"],
        ["userUuid", "DESC"]
      ]
    }),
  truncate: () => Admin.truncate({ cascade: true })
};
