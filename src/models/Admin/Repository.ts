import { Transaction } from "sequelize";
import { AdminNotFoundError } from "./Errors";
import { Admin } from "..";
import { PaginationQuery } from "../PaginationQuery";
import { IPaginatedInput } from "$src/graphql/Pagination/Types/GraphQLPaginatedInput";

export const AdminRepository = {
  save: (admin: Admin, transaction?: Transaction) => admin.save({ transaction }),
  findByUserUuidIfExists: async (userUuid: string) => Admin.findByPk(userUuid),
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
