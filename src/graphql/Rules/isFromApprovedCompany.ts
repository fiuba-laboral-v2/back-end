import { chain } from "graphql-shield";
import { UnauthorizedError } from "../Errors";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { isCompanyUser } from "./isCompanyUser";
import { CompanyRepository } from "$models/Company";
import { rule } from "./rule";
import { IApolloServerContext } from "$graphql/Context";

const companyIsApproved = rule(async (_, __, { currentUser }: IApolloServerContext) => {
  const company = await CompanyRepository.findByUuid(currentUser.getCompanyRole().companyUuid);
  if (company.approvalStatus !== ApprovalStatus.approved) return new UnauthorizedError();
  return true;
});

export const isFromApprovedCompany = chain(isCompanyUser, companyIsApproved);
