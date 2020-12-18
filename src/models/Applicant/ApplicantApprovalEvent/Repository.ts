import { Transaction } from "sequelize";
import { ApplicantApprovalEvent } from "$models";
import { ApplicantApprovalEventNotFoundError } from "./Errors";

export const ApplicantApprovalEventRepository = {
  save: (event: ApplicantApprovalEvent, transaction?: Transaction) => event.save({ transaction }),
  findByUuid: async (uuid: string) => {
    const event = await ApplicantApprovalEvent.findByPk(uuid);
    if (!event) throw new ApplicantApprovalEventNotFoundError(uuid);

    return event;
  },
  findAll: () => ApplicantApprovalEvent.findAll(),
  truncate: () => ApplicantApprovalEvent.truncate({ cascade: true })
};
