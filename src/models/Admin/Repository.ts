import { Transaction, Op } from "sequelize";
import { AdminNotFoundError } from "./Errors";
import { Admin } from "..";
import { PaginationQuery } from "../PaginationQuery";
import { IPaginatedInput } from "$src/graphql/Pagination/Types/GraphQLPaginatedInput";
import { Secretary } from "$models/Admin/Interface";

export const AdminRepository = {
  save: (admin: Admin, transaction?: Transaction) => admin.save({ transaction }),
  delete: (admin: Admin) => admin.destroy(),
  findByUserUuidIfExists: async (userUuid: string) => Admin.findByPk(userUuid),
  findByUserUuid: async (userUuid: string) => {
    const admin = await Admin.findByPk(userUuid);
    if (!admin) throw new AdminNotFoundError(userUuid);

    return admin;
  },
  findDeletedByUserUuid: async (userUuid: string) => {
    const admin = await Admin.findOne({
      where: { userUuid, deletedAt: { [Op.not]: null } },
      paranoid: false
    });
    if (!admin) throw new AdminNotFoundError(userUuid);

    return admin;
  },
  findAll: () => Admin.findAll(),
  findFirstBySecretary: async (secretary: Secretary) => {
    const admin = await Admin.findOne({ where: { secretary } });
    if (!admin) throw new AdminNotFoundError();

    return admin;
  },
  findLatest: (updatedBeforeThan?: IPaginatedInput) =>
    PaginationQuery.findLatest({
      updatedBeforeThan,
      query: options => Admin.findAll({ ...options, paranoid: false }),
      uuidKey: "userUuid",
      timestampKey: "createdAt"
    }),
  truncate: () => Admin.truncate({ cascade: true })
};
