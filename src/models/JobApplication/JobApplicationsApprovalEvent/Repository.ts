import { Transaction } from "sequelize";
import { JobApplicationApprovalEvent } from "$models";
import { JobApplicationsApprovalEventNotFoundError } from "./Errors";

export const JobApplicationApprovalEventRepository = {
  save: (event: JobApplicationApprovalEvent, transaction?: Transaction) =>
    event.save({ transaction }),
  findByUuid: async (uuid: string) => {
    const event = await JobApplicationApprovalEvent.findByPk(uuid);
    if (!event) throw new JobApplicationsApprovalEventNotFoundError(uuid);

    return event;
  },
  findAll: () => JobApplicationApprovalEvent.findAll(),
  truncate: () => JobApplicationApprovalEvent.truncate({ cascade: true })
};
