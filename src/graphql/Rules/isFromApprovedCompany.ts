import { chain } from "graphql-shield";
import { CurrentUser } from "$models/CurrentUser";
import { UnauthorizedError } from "../Errors";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { isCompanyUser } from "./isCompanyUser";
import { CompanyRepository } from "$models/Company";
import { rule } from "./rule";

const companyIsApproved = rule(
  async (parent, args, { currentUser }: { currentUser: CurrentUser }) => {
    const company = await CompanyRepository.findByUuid(currentUser.getCompany().companyUuid);
    if (company.approvalStatus !== ApprovalStatus.approved) return new UnauthorizedError();
    return true;
  }
);

export const isFromApprovedCompany = chain(isCompanyUser, companyIsApproved);
