import { IPaginatedInput } from "$src/graphql/Pagination/Types/GraphQLPaginatedInput";
import { FindOptions, Op } from "sequelize";
import { PaginationConfig } from "$config/PaginationConfig";

interface IFindLatest<Model> extends FindOptions {
  updatedBeforeThan?: IPaginatedInput;
  query: (options?: FindOptions) => Promise<Model[]>;
}

export const PaginationQuery = {
  findLatest: async <Model>({
    updatedBeforeThan,
    query,
    where,
    order,
    ...findOptions
  }: IFindLatest<Model>) => {
    const limit = PaginationConfig.itemsPerPage() + 1;

    const result = await query({
      ...findOptions,
      where: {
        ...where,
        ...(updatedBeforeThan && {
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
        })
      },
      order: order || [
        ["updatedAt", "DESC"],
        ["uuid", "DESC"]
      ],
      limit
    });

    return {
      shouldFetchMore: result.length === limit,
      results: result.slice(0, limit - 1)
    };
  }
};
