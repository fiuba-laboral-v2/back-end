import { Transaction } from "sequelize";
import { OfferApprovalEvent } from "$models";
import { OfferApprovalEventNotFoundError } from "./Errors";

export const OfferApprovalEventRepository = {
  save: (event: OfferApprovalEvent, transaction?: Transaction) => event.save({ transaction }),
  findByUuid: async (uuid: string) => {
    const event = await OfferApprovalEvent.findByPk(uuid);
    if (!event) throw new OfferApprovalEventNotFoundError(uuid);

    return event;
  },
  findAll: () => OfferApprovalEvent.findAll(),
  truncate: () => OfferApprovalEvent.truncate({ cascade: true })
};
