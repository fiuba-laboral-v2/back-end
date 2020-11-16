import { IPaginatedInput } from "$graphql/Pagination/Types/GraphQLPaginatedInput";

export interface IFindAll {
  receiverUuid: string;
  updatedBeforeThan?: IPaginatedInput;
}
