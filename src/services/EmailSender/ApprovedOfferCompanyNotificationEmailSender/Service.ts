import { FrontendConfig } from "$config";
import { ApprovedOfferCompanyNotification } from "$models/CompanyNotification";
import { CompanyUserRepository } from "$models/CompanyUser";
import { EmailService } from "$services/Email";
import { UserRepository } from "$models/User";
import { TranslationRepository } from "$models/Translation";
import { OfferRepository } from "$models/Offer";
import { AdminRepository } from "$models/Admin";
import { template } from "lodash";

const getReceiverEmails = async (companyUuid: string) => {
  const companyUsers = await CompanyUserRepository.findByCompanyUuid(companyUuid);
  const receivers = await UserRepository.findByUuids(companyUsers.map(({ userUuid }) => userUuid));
  return receivers.map(({ email }) => email);
};

export const ApprovedOfferCompanyNotificationEmailSender = {
  send: async (notification: ApprovedOfferCompanyNotification) => {
    const offer = await OfferRepository.findByUuid(notification.offerUuid);
    const sender = await UserRepository.findByUuid(notification.moderatorUuid);
    const admin = await AdminRepository.findByUserUuid(notification.moderatorUuid);
    const { subject, body } = TranslationRepository.translate(
      "approvedOfferCompanyNotificationEmail"
    );
    const signatures = TranslationRepository.translate("emailSignature");
    const { baseUrl, subDomain, endpoints } = FrontendConfig;

    return EmailService.send({
      receiverEmails: await getReceiverEmails(notification.notifiedCompanyUuid),
      sender: {
        email: sender.email,
        name: `${sender.name} ${sender.surname}`
      },
      subject: subject,
      body: template(body)({
        offerTitle: offer.title,
        offerLink: `${baseUrl}/${subDomain}/${endpoints.company.offer(offer.uuid)}`,
        signature: signatures[admin.secretary]
      })
    });
  }
};
