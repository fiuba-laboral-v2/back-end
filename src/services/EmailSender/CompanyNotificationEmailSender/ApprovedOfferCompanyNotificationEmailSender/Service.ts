import { FrontendConfig } from "$config";
import { ApprovedOfferCompanyNotification } from "$models/CompanyNotification";
import { OfferRepository } from "$models/Offer";
import { CompanyNotificationEmailSender } from "..";

export const ApprovedOfferCompanyNotificationEmailSender = {
  send: async (notification: ApprovedOfferCompanyNotification) => {
    const offer = await OfferRepository.findByUuid(notification.offerUuid);
    const { baseUrl, subDomain, endpoints } = FrontendConfig;

    const bodyTemplate = (signature: string) => ({
      offerTitle: offer.title,
      offerLink: `${baseUrl}/${subDomain}/${endpoints.company.offer(offer.uuid)}`,
      signature
    });

    return CompanyNotificationEmailSender.send(
      notification,
      bodyTemplate,
      "approvedOfferCompanyNotificationEmail"
    );
  }
};
