import { ICreateApplicantApprovalEvent } from "./Interfaces";
import { ApplicantApprovalEvent } from "./Model";

export const ApplicantApprovalEventRepository = {
  create: ({ adminUserUuid, applicantUuid, status, transaction }: ICreateApplicantApprovalEvent) =>
    ApplicantApprovalEvent.create(
      {
        userUuid: adminUserUuid,
        applicantUuid,
        status
      },
      { transaction }
    ),
  findAll: () => ApplicantApprovalEvent.findAll(),
  truncate: () => ApplicantApprovalEvent.truncate({ cascade: true })
};
