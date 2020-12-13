import { FrontEndLinksBuilder } from "$services/EmailSender/FrontEndLinksBuilder";
import { RejectedOfferCompanyNotification } from "$models/CompanyNotification";
import { OfferRepository } from "$models/Offer";
import { CompanyNotificationEmailSender } from "..";

export const RejectedOfferCompanyNotificationEmailSender = {
  send: async (notification: RejectedOfferCompanyNotification) => {
    const offer = await OfferRepository.findByUuid(notification.offerUuid);

    const bodyTemplate = (signature: string) => ({
      offerTitle: offer.title,
      offerLink: FrontEndLinksBuilder.company.offerLink(offer.uuid),
      rejectionReason: notification.moderatorMessage,
      signature
    });

    return CompanyNotificationEmailSender.send(
      notification,
      bodyTemplate,
      "rejectedOfferCompanyNotificationEmail"
    );
  }
};
