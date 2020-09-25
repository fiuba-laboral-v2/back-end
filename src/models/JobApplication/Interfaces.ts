import { Admin } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { IPaginatedInput } from "$graphql/Pagination/Types/GraphQLPaginatedInput";

export interface IUpdateApprovalStatus {
  admin: Admin;
  uuid: string;
  status: ApprovalStatus;
}

export interface IFindLatestByCompanyUuid {
  companyUuid: string;
  updatedBeforeThan?: IPaginatedInput;
  approvalStatus?: ApprovalStatus;
}
