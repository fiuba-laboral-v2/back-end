import { IPaginatedInput } from "$graphql/Pagination/Types/GraphQLPaginatedInput";

export interface IFindAll {
  userUuid: string;
  updatedBeforeThan?: IPaginatedInput;
}
