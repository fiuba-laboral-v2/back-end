import { Database } from "$config";
import { ISaveAdmin } from "./Interface";
import { UserRepository } from "$models/User";
import { AdminNotFoundError } from "./Errors";
import { Admin } from "..";
import { PaginationQuery } from "../PaginationQuery";
import { IPaginatedInput } from "$src/graphql/Pagination/Types/GraphQLPaginatedInput";
import { User } from "../User/Model";
import { Op } from "sequelize";

export const AdminRepository = {
  create: ({ user: userAttributes, secretary }: ISaveAdmin) =>
    Database.transaction(async transaction => {
      const { uuid: userUuid } = await UserRepository.create(userAttributes, transaction);
      return Admin.create({ userUuid, secretary }, { transaction });
    }),
  findByUserUuid: async (userUuid: string) => {
    const admin = await Admin.findByPk(userUuid);
    if (!admin) throw new AdminNotFoundError(userUuid);

    return admin;
  },
  findAll: () => Admin.findAll(),
  findLatest: (updatedBeforeThan?: IPaginatedInput) =>
    PaginationQuery.findLatest({
      query: options => Admin.findAll(options),
      order: [
        ["updatedAt", "DESC"],
        ["userUuid", "DESC"]
      ],
      include: [
        {
          model: User,
          attributes: []
        }
      ],
      ...(updatedBeforeThan && {
        where: {
          [Op.or]: [
            {
              updatedAt: {
                [Op.lt]: updatedBeforeThan.dateTime.toISOString()
              }
            },
            {
              updatedAt: updatedBeforeThan.dateTime.toISOString(),
              userUuid: {
                [Op.lt]: updatedBeforeThan.uuid
              }
            }
          ]
        }
      })
    }),
  truncate: () => Admin.truncate({ cascade: true })
};
