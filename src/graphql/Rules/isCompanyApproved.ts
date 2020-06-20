import { chain, rule } from "graphql-shield";
import { ICompanyUser } from "../Context";
import { UnauthorizedError } from "../Errors";
import { ApprovalStatus } from "../../models/ApprovalStatus";
import { isCompanyUser } from "./isCompanyUser";

const companyIsApproved = rule({ cache: "contextual" })
  (async (parent, args, { currentUser }: { currentUser: ICompanyUser }) => {
    const actualStatus = currentUser.company.approvalStatus;
    if (actualStatus !== ApprovalStatus.approved) throw new UnauthorizedError();
    return true;
  });

export const isCompanyApproved = chain(isCompanyUser, companyIsApproved);
