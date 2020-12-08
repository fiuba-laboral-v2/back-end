import { CompanyNotification } from "$models/CompanyNotification";
import { CompanyUserRepository } from "$models/CompanyUser";
import { EmailService } from "$services/Email";
import { Sender } from "$services/EmailSender/Sender";
import { UserRepository } from "$models/User";
import { TranslationRepository } from "$models/Translation";

const getReceiverEmails = async (companyUuid: string) => {
  const companyUsers = await CompanyUserRepository.findByCompanyUuid(companyUuid);
  const receivers = await UserRepository.findByUuids(companyUsers.map(({ userUuid }) => userUuid));
  return receivers.map(({ email }) => email);
};

export const CompanyNotificationEmailSender = {
  send: async (
    notification: CompanyNotification,
    body: (signature: string) => string,
    subject: string
  ) => {
    return EmailService.send({
      receiverEmails: await getReceiverEmails(notification.notifiedCompanyUuid),
      sender: await Sender.findByAdmin(notification.moderatorUuid),
      subject,
      body: body(await TranslationRepository.findSignatureByAdmin(notification.moderatorUuid))
    });
  }
};
