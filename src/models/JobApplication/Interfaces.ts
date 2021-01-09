import { ApprovalStatus } from "$models/ApprovalStatus";
import { IPaginatedInput } from "$graphql/Pagination/Types/GraphQLPaginatedInput";

export interface IFindLatestByCompanyUuid {
  companyUuid: string;
  updatedBeforeThan?: IPaginatedInput;
  approvalStatus?: ApprovalStatus;
}

export interface IFindLatest {
  updatedBeforeThan?: IPaginatedInput;
  companyName?: string;
  applicantName?: string;
  offerTitle?: string;
}
