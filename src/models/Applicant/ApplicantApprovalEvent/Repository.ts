import { ICreateApplicantApprovalEvent } from "./Interfaces";
import { ApplicantApprovalEvent } from "$models";

export const ApplicantApprovalEventRepository = {
  create: ({ adminUserUuid, applicantUuid, status, transaction }: ICreateApplicantApprovalEvent) =>
    ApplicantApprovalEvent.create(
      {
        adminUserUuid,
        applicantUuid,
        status
      },
      { transaction }
    ),
  findAll: () => ApplicantApprovalEvent.findAll(),
  truncate: () => ApplicantApprovalEvent.truncate({ cascade: true })
};
