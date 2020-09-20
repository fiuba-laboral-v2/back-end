import { chain } from "graphql-shield";
import { CurrentUser } from "$models/CurrentUser";
import { UnauthorizedError } from "../Errors";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { isApplicant } from "./isApplicant";
import { rule } from "./rule";
import { ApplicantRepository } from "$models/Applicant";

const applicantIsApproved = rule(
  async (parent, args, { currentUser }: { currentUser: CurrentUser }) => {
    const applicant = await ApplicantRepository.findByUuid(
      currentUser.getApplicant().applicantUuid
    );
    if (applicant.approvalStatus !== ApprovalStatus.approved) return new UnauthorizedError();
    return true;
  }
);

export const isApprovedApplicant = chain(isApplicant, applicantIsApproved);
