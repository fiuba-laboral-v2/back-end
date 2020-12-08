import { CompanyNotification } from "$models/CompanyNotification";
import { CompanyUserRepository } from "$models/CompanyUser";
import { EmailService } from "$services/Email";
import { UserRepository } from "$models/User";
import { TranslationRepository } from "$models/Translation";

const getReceiverEmails = async (companyUuid: string) => {
  const companyUsers = await CompanyUserRepository.findByCompanyUuid(companyUuid);
  const receivers = await UserRepository.findByUuids(companyUsers.map(({ userUuid }) => userUuid));
  return receivers.map(({ email }) => email);
};

const getSender = async (adminUserUuid: string) => {
  const sender = await UserRepository.findByUuid(adminUserUuid);
  return {
    email: sender.email,
    name: `${sender.name} ${sender.surname}`
  };
};

export const CompanyNotificationEmailSender = {
  send: async (
    notification: CompanyNotification,
    body: (signature: string) => string,
    subject: string
  ) => {
    return EmailService.send({
      receiverEmails: await getReceiverEmails(notification.notifiedCompanyUuid),
      sender: await getSender(notification.moderatorUuid),
      subject,
      body: body(await TranslationRepository.findSignatureByAdmin(notification.moderatorUuid))
    });
  }
};
