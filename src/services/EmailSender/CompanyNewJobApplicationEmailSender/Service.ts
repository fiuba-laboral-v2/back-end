import { FrontendConfig } from "$config";
import { CompanyNewJobApplicationNotification } from "$models/CompanyNotification";
import { CompanyUserRepository } from "$models/CompanyUser";
import { EmailService } from "$services/Email";
import { UserRepository } from "$models/User";
import { TranslationRepository } from "$models/Translation";
import { JobApplicationRepository } from "$models/JobApplication";
import { OfferRepository } from "$models/Offer";
import { template } from "lodash";
import { ApplicantRepository } from "$models/Applicant";
import { AdminRepository } from "$models/Admin";

export const CompanyNewJobApplicationEmailSender = {
  send: async (notification: CompanyNewJobApplicationNotification) => {
    const companyUuid = notification.notifiedCompanyUuid;
    const companyUsers = await CompanyUserRepository.findByCompanyUuid(companyUuid);
    const userUuids = companyUsers.map(({ userUuid }) => userUuid);
    const users = await UserRepository.findByUuids(userUuids);
    const receiverEmails = users.map(({ email }) => email);
    const sender = await UserRepository.findByUuid(notification.moderatorUuid);
    const { offerUuid, applicantUuid } = await JobApplicationRepository.findByUuid(
      notification.jobApplicationUuid
    );
    const offer = await OfferRepository.findByUuid(offerUuid);
    const admin = await AdminRepository.findByUserUuid(notification.moderatorUuid);
    const signatures = TranslationRepository.translate("emailSignature");
    const signature = signatures.find(({ key }) => key === admin.secretary).value;
    const [subject, body] = TranslationRepository.translate(
      "companyNewJobApplicationNotificationEmail"
    );
    const applicant = await ApplicantRepository.findByUuid(applicantUuid);
    const applicantUser = await UserRepository.findByUuid(applicant.userUuid);
    const { baseUrl, subDomain, endpoints } = FrontendConfig;
    return EmailService.send({
      receiverEmails,
      sender: {
        email: sender.email,
        name: `${sender.name} ${sender.surname}`
      },
      subject: subject.value,
      body: template(body.value)({
        offerTitle: offer.title,
        offerLink: `${baseUrl}/${subDomain}/${endpoints.company.offer(offerUuid)}`,
        applicantName: `${applicantUser.name} ${applicantUser.surname}`,
        ApplicantLink: `${baseUrl}/${subDomain}/${endpoints.company.applicant(applicantUuid)}`,
        signature
      })
    });
  }
};
