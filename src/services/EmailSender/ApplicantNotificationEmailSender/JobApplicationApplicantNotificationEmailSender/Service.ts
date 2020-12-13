import { FrontendConfig } from "$config";
import {
  RejectedJobApplicationApplicantNotification,
  ApprovedJobApplicationApplicantNotification
} from "$models/ApplicantNotification";
import { EmailService } from "$services/Email";
import { Sender } from "$services/EmailSender/Sender";

import { ApplicantRepository } from "$models/Applicant";
import { JobApplicationRepository } from "$models/JobApplication";
import { OfferRepository } from "$models/Offer";
import { UserRepository } from "$models/User";
import { TranslationRepository } from "$models/Translation";
import { template } from "lodash";

type JobApplicationApplicantNotification =
  | RejectedJobApplicationApplicantNotification
  | ApprovedJobApplicationApplicantNotification;

const getRejectionReason = (notification: JobApplicationApplicantNotification) => {
  if (!(notification instanceof RejectedJobApplicationApplicantNotification)) return;
  return { rejectionReason: notification.moderatorMessage };
};

export const JobApplicationApplicantNotificationEmailSender = {
  send: async ({ notification, emailTranslationGroup }: ISendAttributes) => {
    const applicant = await ApplicantRepository.findByUuid(notification.notifiedApplicantUuid);
    const applicantUser = await UserRepository.findByUuid(applicant.userUuid);
    const { offerUuid } = await JobApplicationRepository.findByUuid(
      notification.jobApplicationUuid
    );
    const offer = await OfferRepository.findByUuid(offerUuid);
    const { subject, body } = TranslationRepository.translate(emailTranslationGroup);
    const signature = await TranslationRepository.findSignatureByAdmin(notification.moderatorUuid);
    const sender = await Sender.findByAdmin(notification.moderatorUuid);
    const { baseUrl, subDomain, endpoints } = FrontendConfig;

    return EmailService.send({
      receiverEmails: [applicantUser.email],
      sender,
      subject,
      body: template(body)({
        offerTitle: offer.title,
        offerLink: `${baseUrl}/${subDomain}/${endpoints.company.offer(offer.uuid)}`,
        ...getRejectionReason(notification),
        signature
      })
    });
  }
};

interface ISendAttributes {
  notification: JobApplicationApplicantNotification;
  emailTranslationGroup: string;
}
