import {
  RejectedJobApplicationApplicantNotification,
  ApprovedJobApplicationApplicantNotification,
  PendingJobApplicationApplicantNotification
} from "$models/ApplicantNotification";
import { EmailService } from "$services/Email";
import { Sender } from "$services/EmailSender/Sender";
import { FrontEndLinksBuilder } from "$services/EmailSender/FrontEndLinksBuilder";
import { ApplicantRepository } from "$models/Applicant";
import { JobApplicationRepository } from "$models/JobApplication";
import { OfferRepository } from "$models/Offer";
import { UserRepository } from "$models/User";
import { TranslationRepository } from "$models/Translation";
import { template } from "lodash";
import { SecretarySettingsRepository } from "$models/SecretarySettings";

type JobApplicationApplicantNotification =
  | RejectedJobApplicationApplicantNotification
  | ApprovedJobApplicationApplicantNotification
  | PendingJobApplicationApplicantNotification;

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
    const settings = await SecretarySettingsRepository.findByAdminUuid(notification.moderatorUuid);
    const sender = await Sender.findByAdmin(notification.moderatorUuid);

    return EmailService.send({
      receiverEmails: [applicantUser.email],
      sender,
      subject,
      body: template(body)({
        offerTitle: offer.title,
        offerLink: FrontEndLinksBuilder.applicant.offerLink(offer.uuid),
        ...getRejectionReason(notification),
        signature: settings.emailSignature
      })
    });
  }
};

interface ISendAttributes {
  notification: JobApplicationApplicantNotification;
  emailTranslationGroup: string;
}
