import { IPaginatedInput } from "$graphql/Pagination/Types/GraphQLPaginatedInput";

export interface IFindLatest {
  companyUuid: string;
  updatedBeforeThan?: IPaginatedInput;
}
