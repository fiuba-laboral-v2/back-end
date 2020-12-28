import { PendingJobApplicationApplicantNotification } from "$models/ApplicantNotification";
import { JobApplicationApplicantNotificationEmailSender } from "../JobApplicationApplicantNotificationEmailSender";

export const PendingJobApplicationApplicantNotificationEmailSender = {
  send: async (notification: PendingJobApplicationApplicantNotification) =>
    JobApplicationApplicantNotificationEmailSender.send({
      notification,
      emailTranslationGroup: "pendingJobApplicationApplicantNotificationEmail"
    })
};
