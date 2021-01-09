import { IPaginatedInput } from "$graphql/Pagination/Types/GraphQLPaginatedInput";

export interface IFindLatest {
  updatedBeforeThan?: IPaginatedInput;
  companyName?: string;
  businessSector?: string;
}
