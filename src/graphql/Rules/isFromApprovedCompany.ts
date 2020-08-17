import { chain } from "graphql-shield";
import { ICompanyUser } from "../Context";
import { UnauthorizedError } from "../Errors";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { isCompanyUser } from "./isCompanyUser";
import { CompanyRepository } from "$models/Company";
import { rule } from "./rule";

const companyIsApproved = rule(
  async (parent, args, { currentUser }: { currentUser: ICompanyUser }) => {
    const company = await CompanyRepository.findByUuid(currentUser.company.uuid);
    if (company.approvalStatus !== ApprovalStatus.approved) return new UnauthorizedError();
    return true;
  }
);

export const isFromApprovedCompany = chain(isCompanyUser, companyIsApproved);
