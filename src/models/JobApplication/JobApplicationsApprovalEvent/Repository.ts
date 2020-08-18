import { ICreateJobApplicationApprovalEvent } from "./Interfaces";
import { JobApplicationApprovalEvent } from "$models";

export const JobApplicationApprovalEventRepository = {
  create: ({
    adminUserUuid,
    offerUuid,
    applicantUuid,
    status
  }: ICreateJobApplicationApprovalEvent) =>
    JobApplicationApprovalEvent.create({
      offerUuid,
      applicantUuid,
      adminUserUuid,
      status
    }),
  findAll: () => JobApplicationApprovalEvent.findAll(),
  truncate: () => JobApplicationApprovalEvent.truncate({ cascade: true })
};
