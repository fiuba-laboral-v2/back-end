import { chain } from "graphql-shield";
import { UnauthorizedError } from "../Errors";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { isApplicant } from "./isApplicant";
import { rule } from "./rule";
import { ApplicantRepository } from "$models/Applicant";
import { IApolloServerContext } from "$graphql/Context";

const applicantIsApproved = rule(async (_, __, { currentUser }: IApolloServerContext) => {
  const applicantUuid = currentUser.getApplicantRole().applicantUuid;
  const applicant = await ApplicantRepository.findByUuid(applicantUuid);
  if (applicant.approvalStatus !== ApprovalStatus.approved) return new UnauthorizedError();
  return true;
});

export const isApprovedApplicant = chain(isApplicant, applicantIsApproved);
