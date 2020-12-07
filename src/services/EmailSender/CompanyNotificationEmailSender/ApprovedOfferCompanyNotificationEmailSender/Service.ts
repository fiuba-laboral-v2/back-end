import { FrontendConfig } from "$config";
import { ApprovedOfferCompanyNotification } from "$models/CompanyNotification";
import { TranslationRepository } from "$models/Translation";
import { OfferRepository } from "$models/Offer";
import { CompanyNotificationEmailSender } from "..";
import { template } from "lodash";

export const ApprovedOfferCompanyNotificationEmailSender = {
  send: async (notification: ApprovedOfferCompanyNotification) => {
    const offer = await OfferRepository.findByUuid(notification.offerUuid);
    const { subject, body } = TranslationRepository.translate(
      "approvedOfferCompanyNotificationEmail"
    );
    const { baseUrl, subDomain, endpoints } = FrontendConfig;

    const buildBody = (signature: string) =>
      template(body)({
        offerTitle: offer.title,
        offerLink: `${baseUrl}/${subDomain}/${endpoints.company.offer(offer.uuid)}`,
        signature
      });

    return CompanyNotificationEmailSender.send(notification, buildBody, subject);
  }
};
