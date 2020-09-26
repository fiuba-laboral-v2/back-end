import { IPaginatedInput } from "$graphql/Pagination/Types/GraphQLPaginatedInput";

export const UpdatedAtWhereClause = {
  build: (updatedBeforeThan?: IPaginatedInput) => {
    if (!updatedBeforeThan) return;
    const updatedAtString = updatedBeforeThan.dateTime.toISOString();
    return `
      (
        ("AdminTask"."updatedAt" < '${updatedAtString}')
        OR (
          "AdminTask"."updatedAt" = '${updatedAtString}'
          AND "AdminTask"."uuid" < '${updatedBeforeThan.uuid}'
        )
      )
    `;
  }
};
