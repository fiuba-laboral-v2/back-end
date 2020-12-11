import { FrontendConfig } from "$config";
import { RejectedOfferCompanyNotification } from "$models/CompanyNotification";
import { TranslationRepository } from "$models/Translation";
import { OfferRepository } from "$models/Offer";
import { CompanyNotificationEmailSender } from "..";
import { template } from "lodash";

export const RejectedOfferCompanyNotificationEmailSender = {
  send: async (notification: RejectedOfferCompanyNotification) => {
    const offer = await OfferRepository.findByUuid(notification.offerUuid);
    const { subject, body } = TranslationRepository.translate(
      "rejectedOfferCompanyNotificationEmail"
    );
    const { baseUrl, subDomain, endpoints } = FrontendConfig;

    const buildBody = (signature: string) =>
      template(body)({
        offerTitle: offer.title,
        offerLink: `${baseUrl}/${subDomain}/${endpoints.company.offer(offer.uuid)}`,
        rejectionReason: notification.moderatorMessage,
        signature
      });

    return CompanyNotificationEmailSender.send(notification, buildBody, subject);
  }
};
