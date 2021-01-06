import { IPaginatedInput } from "$src/graphql/Pagination/Types/GraphQLPaginatedInput";
import { FindOptions, Op, WhereAttributeHash } from "sequelize";
import { PaginationConfig } from "$config/PaginationConfig";

interface IFindLatest<Model> extends FindOptions {
  updatedBeforeThan?: IPaginatedInput;
  query: (options?: FindOptions) => Promise<Model[]>;
  where?: WhereAttributeHash;
  uuidKey?: "uuid" | "userUuid";
  timestampKey?: "createdAt" | "updatedAt";
  noLimit?: boolean;
}

export const PaginationQuery = {
  findLatest: async <Model>({
    noLimit,
    updatedBeforeThan,
    query,
    where,
    uuidKey = "uuid",
    timestampKey = "updatedAt",
    ...findOptions
  }: IFindLatest<Model>) => {
    const limit = PaginationConfig.itemsPerPage() + 1;

    const conditions: WhereAttributeHash[] = [];
    if (where) conditions.push(where);
    if (updatedBeforeThan) {
      conditions.push({
        [Op.or]: [
          {
            [timestampKey]: {
              [Op.lt]: updatedBeforeThan.dateTime.toISOString()
            }
          },
          {
            [timestampKey]: updatedBeforeThan.dateTime.toISOString(),
            [uuidKey]: {
              [Op.lt]: updatedBeforeThan.uuid
            }
          }
        ]
      });
    }

    const result = await query({
      ...findOptions,
      ...(conditions.length !== 0 && {
        where: {
          [Op.and]: conditions
        }
      }),
      order: [
        [timestampKey, "DESC"],
        [uuidKey, "DESC"]
      ],
      ...(!noLimit && { limit })
    });

    return {
      shouldFetchMore: noLimit ? false : result.length === limit,
      results: noLimit ? result : result.slice(0, limit - 1)
    };
  }
};
