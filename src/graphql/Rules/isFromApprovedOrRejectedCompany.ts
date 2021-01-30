import { chain } from "graphql-shield";
import { UnauthorizedError } from "../Errors";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { isCompanyUser } from "./isCompanyUser";
import { CompanyRepository } from "$models/Company";
import { rule } from "./rule";
import { IApolloServerContext } from "$graphql/Context";

const companyIsApprovedOrRejected = rule(async (_, __, { currentUser }: IApolloServerContext) => {
  const company = await CompanyRepository.findByUuid(currentUser.getCompanyRole().companyUuid);
  if (company.approvalStatus === ApprovalStatus.approved) return true;
  if (company.approvalStatus === ApprovalStatus.rejected) return true;
  return new UnauthorizedError();
});

export const isFromApprovedOrRejectedCompany = chain(isCompanyUser, companyIsApprovedOrRejected);
