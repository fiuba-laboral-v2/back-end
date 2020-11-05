import { ApprovalStatus } from "$models/ApprovalStatus";
import { IPaginatedInput } from "$graphql/Pagination/Types/GraphQLPaginatedInput";

export interface IFindLatestByCompanyUuid {
  companyUuid: string;
  updatedBeforeThan?: IPaginatedInput;
  approvalStatus?: ApprovalStatus;
}
