import { Admin, Offer } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { MissingModeratorMessageError } from "..";
import {
  ApprovedOfferCompanyNotification,
  RejectedOfferCompanyNotification
} from "$models/CompanyNotification";

export const OfferNotificationFactory = {
  create: (offer: Offer, admin: Admin, moderatorMessage?: string) => {
    if (offer.getStatus(admin.secretary) === ApprovalStatus.approved) {
      return [
        new ApprovedOfferCompanyNotification({
          moderatorUuid: admin.userUuid,
          notifiedCompanyUuid: offer.companyUuid,
          offerUuid: offer.uuid
        })
      ];
    } else if (offer.getStatus(admin.secretary) === ApprovalStatus.rejected) {
      if (!moderatorMessage) throw new MissingModeratorMessageError();
      return [
        new RejectedOfferCompanyNotification({
          moderatorUuid: admin.userUuid,
          notifiedCompanyUuid: offer.companyUuid,
          offerUuid: offer.uuid,
          moderatorMessage
        })
      ];
    }
    return [];
  }
};
