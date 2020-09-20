import { chain } from "graphql-shield";
import { IApplicantUser } from "../Context";
import { UnauthorizedError } from "../Errors";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { isApplicant } from "./isApplicant";
import { rule } from "./rule";
import { ApplicantRepository } from "$models/Applicant";

const applicantIsApproved = rule(
  async (_, __, { currentUser }: { currentUser: IApplicantUser }) => {
    const applicant = await ApplicantRepository.findByUuid(currentUser.applicant.uuid);
    if (applicant.approvalStatus !== ApprovalStatus.approved) return new UnauthorizedError();
    return true;
  }
);

export const isApprovedApplicant = chain(isApplicant, applicantIsApproved);
