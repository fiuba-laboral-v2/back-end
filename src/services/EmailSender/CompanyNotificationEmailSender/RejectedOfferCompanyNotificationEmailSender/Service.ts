import { FrontendConfig } from "$config";
import { RejectedOfferCompanyNotification } from "$models/CompanyNotification";
import { OfferRepository } from "$models/Offer";
import { CompanyNotificationEmailSender } from "..";

export const RejectedOfferCompanyNotificationEmailSender = {
  send: async (notification: RejectedOfferCompanyNotification) => {
    const offer = await OfferRepository.findByUuid(notification.offerUuid);
    const { baseUrl, subDomain, endpoints } = FrontendConfig;

    const bodyTemplate = (signature: string) => ({
      offerTitle: offer.title,
      offerLink: `${baseUrl}/${subDomain}/${endpoints.company.offer(offer.uuid)}`,
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
