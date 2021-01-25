import { CompanyNotification } from "$models/CompanyNotification";
import { CompanyUserRepository } from "$models/CompanyUser";
import { Sender } from "$services/EmailSender/Sender";
import { UserRepository } from "$models/User";
import { TranslationRepository } from "$models/Translation";
import { template } from "lodash";
import { SecretarySettingsRepository } from "$models/SecretarySettings";
import { NotificationEmailSender } from "$services/EmailSender/NotificationEmailSender";
import { CompanyNotificationSequelizeModel } from "$models";

const getReceiverEmails = async (companyUuid: string) => {
  const companyUsers = await CompanyUserRepository.findByCompanyUuid(companyUuid);
  const receivers = await UserRepository.findByUuids(companyUsers.map(({ userUuid }) => userUuid));
  return receivers.map(({ email }) => email);
};

export const CompanyNotificationEmailSender = {
  send: async (
    notification: CompanyNotification,
    bodyTemplate: (signature: string) => object,
    emailTranslationGroup: string
  ) => {
    const { subject, body } = TranslationRepository.translate(emailTranslationGroup);
    const settings = await SecretarySettingsRepository.findByAdminUuid(notification.moderatorUuid);
    const receiverEmails = await getReceiverEmails(notification.notifiedCompanyUuid);
    const sender = await Sender.findByAdmin(notification.moderatorUuid);
    const emailParams = {
      receiverEmails,
      sender,
      subject,
      body: template(body)(bodyTemplate(settings.emailSignature))
    };

    const emailSender = new NotificationEmailSender(
      notification,
      CompanyNotificationSequelizeModel.tableName,
      emailParams
    );
    return emailSender.send();
  }
};
