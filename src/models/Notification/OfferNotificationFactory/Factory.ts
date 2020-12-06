import { Admin, Offer } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { ApprovedOfferCompanyNotification } from "$models/CompanyNotification";

export const OfferNotificationFactory = {
  create: (offer: Offer, admin: Admin) => {
    if (offer.getStatus(admin.secretary) === ApprovalStatus.approved) {
      return [
        new ApprovedOfferCompanyNotification({
          moderatorUuid: admin.userUuid,
          notifiedCompanyUuid: offer.companyUuid,
          offerUuid: offer.uuid
        })
      ];
    }
    return [];
  }
};
