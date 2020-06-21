import { chain, rule } from "graphql-shield";
import { ICompanyUser } from "../Context";
import { UnauthorizedError } from "../Errors";
import { ApprovalStatus } from "../../models/ApprovalStatus";
import { isCompanyUser } from "./isCompanyUser";
import { CompanyRepository } from "../../models/Company";

const companyIsApproved = rule({ cache: "contextual" })
  (async (parent, args, { currentUser }: { currentUser: ICompanyUser }) => {
    const company = await CompanyRepository.findByUuid(currentUser.company.uuid);
    if (company.approvalStatus !== ApprovalStatus.approved) throw new UnauthorizedError();
    return true;
  });

export const isApprovedCompany = chain(isCompanyUser, companyIsApproved);
