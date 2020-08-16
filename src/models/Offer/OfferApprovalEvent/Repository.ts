import { ICreateOfferApprovalEvent } from "./Interface";
import { OfferApprovalEvent } from "$models";

export const OfferApprovalEventRepository = {
  create: async ({ adminUserUuid, offer, status, transaction }: ICreateOfferApprovalEvent) =>
    OfferApprovalEvent.create(
      {
        adminUserUuid,
        offerUuid: offer.uuid,
        status,
      },
      { transaction }
    ),
  findAll: () => OfferApprovalEvent.findAll(),
  truncate: () => OfferApprovalEvent.truncate({ cascade: true }),
};
