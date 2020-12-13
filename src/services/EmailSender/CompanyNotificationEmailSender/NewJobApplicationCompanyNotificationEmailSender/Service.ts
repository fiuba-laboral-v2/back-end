import { FrontEndLinksBuilder } from "$services/EmailSender/FrontEndLinksBuilder";
import { NewJobApplicationCompanyNotification } from "$models/CompanyNotification";
import { UserRepository } from "$models/User";
import { JobApplicationRepository } from "$models/JobApplication";
import { OfferRepository } from "$models/Offer";
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

    const bodyTemplate = (signature: string) => ({
      offerTitle: offer.title,
      offerLink: FrontEndLinksBuilder.company.offerLink(offer.uuid),
      applicantName: `${applicantUser.name} ${applicantUser.surname}`,
      applicantLink: FrontEndLinksBuilder.company.applicantLink(applicant.uuid),
      signature
    });

    return CompanyNotificationEmailSender.send(
      notification,
      bodyTemplate,
      "newJobApplicationCompanyNotificationEmail"
    );
  }
};
