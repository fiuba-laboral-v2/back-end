import { FrontEndLinksBuilder } from "$services/EmailSender/FrontEndLinksBuilder";
import { ApprovedOfferCompanyNotification } from "$models/CompanyNotification";
import { OfferRepository } from "$models/Offer";
import { CompanyNotificationEmailSender } from "..";

export const ApprovedOfferCompanyNotificationEmailSender = {
  send: async (notification: ApprovedOfferCompanyNotification) => {
    const offer = await OfferRepository.findByUuid(notification.offerUuid);

    const bodyTemplate = (signature: string) => ({
      offerTitle: offer.title,
      offerLink: FrontEndLinksBuilder.company.offerLink(offer.uuid),
      signature
    });

    return CompanyNotificationEmailSender.send(
      notification,
      bodyTemplate,
      "approvedOfferCompanyNotificationEmail"
    );
  }
};
