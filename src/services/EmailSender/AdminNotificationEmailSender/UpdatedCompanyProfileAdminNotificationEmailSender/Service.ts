import { UpdatedCompanyProfileAdminNotification } from "$models/AdminNotification";
import { TranslationRepository } from "$models/Translation";
import { CompanyRepository } from "$models/Company";
import { SecretarySettingsRepository } from "$models/SecretarySettings";
import { AdminNotificationSequelizeModel } from "$models";
import { Sender } from "$services/EmailSender/Sender";
import { template } from "lodash";
import { FrontEndLinksBuilder } from "$services/EmailSender/FrontEndLinksBuilder";
import { NotificationEmailSender } from "$services/EmailSender/NotificationEmailSender";

export const UpdatedCompanyProfileAdminNotificationEmailSender = {
  send: async (notification: UpdatedCompanyProfileAdminNotification) => {
    const company = await CompanyRepository.findByUuid(notification.companyUuid);
    const settings = await SecretarySettingsRepository.findBySecretary(notification.secretary);
    const { subject, body } = TranslationRepository.translate(
      "updatedCompanyProfileAdminNotificationEmail"
    );

    const emailParams = {
      receiverEmails: [settings.email],
      sender: Sender.noReply(),
      subject,
      body: template(body)({
        companyName: company.companyName,
        companyLink: FrontEndLinksBuilder.admin.company.profileLink(notification.companyUuid)
      })
    };
    const emailSender = new NotificationEmailSender(
      notification,
      AdminNotificationSequelizeModel.tableName,
      emailParams
    );
    return emailSender.send();
  }
};
