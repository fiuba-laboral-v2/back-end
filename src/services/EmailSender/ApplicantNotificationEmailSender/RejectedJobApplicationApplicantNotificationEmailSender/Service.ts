import { FrontendConfig } from "$config";
import { RejectedJobApplicationApplicantNotification } from "$models/ApplicantNotification";
import { EmailService } from "$services/Email";
import { Sender } from "$services/EmailSender/Sender";

import { ApplicantRepository } from "$models/Applicant";
import { JobApplicationRepository } from "$models/JobApplication";
import { OfferRepository } from "$models/Offer";
import { UserRepository } from "$models/User";
import { TranslationRepository } from "$models/Translation";
import { template } from "lodash";

export const RejectedJobApplicationApplicantNotificationEmailSender = {
  send: async (notification: RejectedJobApplicationApplicantNotification) => {
    const applicant = await ApplicantRepository.findByUuid(notification.notifiedApplicantUuid);
    const applicantUser = await UserRepository.findByUuid(applicant.userUuid);
    const { offerUuid } = await JobApplicationRepository.findByUuid(
      notification.jobApplicationUuid
    );
    const offer = await OfferRepository.findByUuid(offerUuid);
    const { subject, body } = TranslationRepository.translate(
      "rejectedJobApplicationApplicantNotificationEmail"
    );

    const { baseUrl, subDomain, endpoints } = FrontendConfig;

    return EmailService.send({
      receiverEmails: [applicantUser.email],
      sender: await Sender.findByAdmin(notification.moderatorUuid),
      subject,
      body: template(body)({
        offerTitle: offer.title,
        offerLink: `${baseUrl}/${subDomain}/${endpoints.company.offer(offer.uuid)}`,
        rejectionReason: notification.moderatorMessage,
        signature: await TranslationRepository.findSignatureByAdmin(notification.moderatorUuid)
      })
    });
  }
};
