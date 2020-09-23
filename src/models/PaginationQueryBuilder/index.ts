import { IPaginatedInput } from "$src/graphql/Pagination/Types/GraphQLPaginatedInput";

import { Applicant, JobApplication, Offer } from "..";
import { Op, Order, WhereOptions } from "sequelize";
import { PaginationConfig } from "$config/PaginationConfig";

type PaginatedModel = Applicant | Offer | JobApplication;

interface IFindLatest<T extends PaginatedModel> {
  updatedBeforeThan?: IPaginatedInput;
  modelCallback: (where: WhereOptions, order: Order, limit: number) => Promise<T[]>;
  whereClause?: any;
  orderBy?: any;
}

export const PaginationQueryBuilder = {
  findLatest: async <T extends PaginatedModel>({
    modelCallback,
    updatedBeforeThan,
    whereClause,
    orderBy
  }: IFindLatest<T>) => {
    const limit = PaginationConfig.itemsPerPage() + 1;
    const defaultWhere = {
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
              uuid: {
                [Op.lt]: updatedBeforeThan.uuid
              }
            }
          ]
        }
      })
    };
    const defaultOrder = {
      order: [
        ["updatedAt", "DESC"],
        ["uuid", "DESC"]
      ]
    };

    const result = await modelCallback(whereClause || defaultWhere, orderBy || defaultOrder, limit);

    return {
      shouldFetchMore: result.length === limit,
      results: result.slice(0, limit - 1)
    };
  }
};
