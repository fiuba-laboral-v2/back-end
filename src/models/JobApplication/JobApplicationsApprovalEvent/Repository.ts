import { ICreateJobApplicationApprovalEvent } from "./Interfaces";
import { JobApplicationApprovalEvent } from "$models";

export const JobApplicationApprovalEventRepository = {
  create: ({
    adminUserUuid,
    jobApplicationUuid,
    status,
    transaction
  }: ICreateJobApplicationApprovalEvent) =>
    JobApplicationApprovalEvent.create(
      {
        jobApplicationUuid,
        adminUserUuid,
        status
      },
      { transaction }
    ),
  findAll: () => JobApplicationApprovalEvent.findAll(),
  truncate: () => JobApplicationApprovalEvent.truncate({ cascade: true })
};
