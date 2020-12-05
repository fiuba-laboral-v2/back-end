import { FrontendConfig } from "$config";
import { NewJobApplicationCompanyNotification } from "$models/CompanyNotification";
import { CompanyUserRepository } from "$models/CompanyUser";
import { EmailService } from "$services/Email";
import { UserRepository } from "$models/User";
import { TranslationRepository } from "$models/Translation";
import { JobApplicationRepository } from "$models/JobApplication";
import { OfferRepository } from "$models/Offer";
import { template } from "lodash";
import { ApplicantRepository } from "$models/Applicant";
import { AdminRepository } from "$models/Admin";

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

const getSignature = async (adminUserUuid: string): Promise<string> => {
  const admin = await AdminRepository.findByUserUuid(adminUserUuid);
  const signatures = TranslationRepository.translate("emailSignature");
  return signatures[admin.secretary];
};

export const NewJobApplicationCompanyNotificationEmailSender = {
  send: async (notification: NewJobApplicationCompanyNotification) => {
    const { offerUuid, applicantUuid } = await JobApplicationRepository.findByUuid(
      notification.jobApplicationUuid
    );
    const offer = await OfferRepository.findByUuid(offerUuid);
    const applicant = await ApplicantRepository.findByUuid(applicantUuid);
    const applicantUser = await UserRepository.findByUuid(applicant.userUuid);

    const { subject, body } = TranslationRepository.translate(
      "newJobApplicationCompanyNotificationEmail"
    );
    const { baseUrl, subDomain, endpoints } = FrontendConfig;

    return EmailService.send({
      receiverEmails: await getReceiverEmails(notification.notifiedCompanyUuid),
      sender: await getSender(notification.moderatorUuid),
      subject: subject,
      body: template(body)({
        offerTitle: offer.title,
        offerLink: `${baseUrl}/${subDomain}/${endpoints.company.offer(offerUuid)}`,
        applicantName: `${applicantUser.name} ${applicantUser.surname}`,
        ApplicantLink: `${baseUrl}/${subDomain}/${endpoints.company.applicant(applicantUuid)}`,
        signature: await getSignature(notification.moderatorUuid)
      })
    });
  }
};
