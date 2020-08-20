import { ICreateJobApplicationApprovalEvent } from "./Interfaces";
import { JobApplicationApprovalEvent } from "$models";

export const JobApplicationApprovalEventRepository = {
  create: ({
    adminUserUuid,
    offerUuid,
    applicantUuid,
    status,
    transaction
  }: ICreateJobApplicationApprovalEvent) =>
    JobApplicationApprovalEvent.create(
      {
        offerUuid,
        applicantUuid,
        adminUserUuid,
        status
      },
      { transaction }
    ),
  findAll: () => JobApplicationApprovalEvent.findAll(),
  truncate: () => JobApplicationApprovalEvent.truncate({ cascade: true })
};
