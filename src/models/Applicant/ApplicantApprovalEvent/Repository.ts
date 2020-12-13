import { Transaction } from "sequelize";
import { ApplicantApprovalEvent } from "$models";

export const ApplicantApprovalEventRepository = {
  save: (event: ApplicantApprovalEvent, transaction?: Transaction) => event.save({ transaction }),
  findAll: () => ApplicantApprovalEvent.findAll(),
  truncate: () => ApplicantApprovalEvent.truncate({ cascade: true })
};
