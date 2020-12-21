import { IPaginatedInput } from "$graphql/Pagination/Types/GraphQLPaginatedInput";

export const UpdatedAtWhereClause = {
  build: ({ updatedBeforeThan, tableName }: IUpdatedAtWhereClauseProps) => {
    if (!updatedBeforeThan) return;
    const updatedAtString = updatedBeforeThan.dateTime.toISOString();
    return `
      (
        ("${tableName}"."updatedAt" < '${updatedAtString}')
        OR (
          "${tableName}"."updatedAt" = '${updatedAtString}'
          AND "${tableName}"."uuid" < '${updatedBeforeThan.uuid}'
        )
      )
    `;
  }
};

interface IUpdatedAtWhereClauseProps {
  updatedBeforeThan?: IPaginatedInput;
  tableName: string;
}
