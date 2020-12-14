import { Transaction } from "sequelize";
import { CompanyApprovalEvent } from "$models";
import { CompanyApprovalEventNotFoundError } from "./Errors";

export const CompanyApprovalEventRepository = {
  save: (event: CompanyApprovalEvent, transaction?: Transaction) => event.save({ transaction }),
  findByUuid: async (uuid: string) => {
    const event = await CompanyApprovalEvent.findByPk(uuid);
    if (!event) throw new CompanyApprovalEventNotFoundError(uuid);

    return event;
  },
  findAll: () => CompanyApprovalEvent.findAll(),
  truncate: () => CompanyApprovalEvent.truncate({ cascade: true })
};
