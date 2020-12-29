import { PendingJobApplicationApplicantNotification } from "$models/ApplicantNotification";
import { JobApplicationApplicantNotificationEmailSender } from "../JobApplicationApplicantNotificationEmailSender";

export const PendingJobApplicationApplicantNotificationEmailSender = {
  send: (notification: PendingJobApplicationApplicantNotification) =>
    JobApplicationApplicantNotificationEmailSender.send({
      notification,
      emailTranslationGroup: "pendingJobApplicationApplicantNotificationEmail"
    })
};
