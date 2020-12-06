import { FrontendConfig } from "$config";
import { NewJobApplicationCompanyNotification } from "$models/CompanyNotification";
import { UserRepository } from "$models/User";
import { TranslationRepository } from "$models/Translation";
import { JobApplicationRepository } from "$models/JobApplication";
import { OfferRepository } from "$models/Offer";
import { template } from "lodash";
import { ApplicantRepository } from "$models/Applicant";
import { CompanyNotificationEmailSender } from "..";

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

    const buildBody = (signature: string) =>
      template(body)({
        offerTitle: offer.title,
        offerLink: `${baseUrl}/${subDomain}/${endpoints.company.offer(offerUuid)}`,
        applicantName: `${applicantUser.name} ${applicantUser.surname}`,
        ApplicantLink: `${baseUrl}/${subDomain}/${endpoints.company.applicant(applicantUuid)}`,
        signature
      });

    return CompanyNotificationEmailSender.send(notification, buildBody, subject);
  }
};
