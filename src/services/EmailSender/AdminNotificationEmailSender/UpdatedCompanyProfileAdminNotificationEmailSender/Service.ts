import { UpdatedCompanyProfileAdminNotification } from "$models/AdminNotification";
import { TranslationRepository } from "$models/Translation";
import { CompanyRepository } from "$models/Company";
import { SecretarySettingsRepository } from "$models/SecretarySettings";
import { EmailService } from "$services/Email";
import { Sender } from "$services/EmailSender/Sender";
import { template } from "lodash";
import { FrontEndLinksBuilder } from "$services/EmailSender/FrontEndLinksBuilder";

export const UpdatedCompanyProfileAdminNotificationEmailSender = {
  send: async (notification: UpdatedCompanyProfileAdminNotification) => {
    const company = await CompanyRepository.findByUuid(notification.companyUuid);
    const settings = await SecretarySettingsRepository.findBySecretary(notification.secretary);
    const { subject, body } = TranslationRepository.translate(
      "updatedCompanyProfileAdminNotificationEmail"
    );

    return EmailService.send({
      params: {
        receiverEmails: [settings.email],
        sender: Sender.noReply(),
        subject,
        body: template(body)({
          companyName: company.companyName,
          companyLink: FrontEndLinksBuilder.admin.company.profileLink(notification.companyUuid)
        })
      }
    });
  }
};
