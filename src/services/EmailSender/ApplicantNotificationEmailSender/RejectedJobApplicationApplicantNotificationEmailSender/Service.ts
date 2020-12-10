import { RejectedJobApplicationApplicantNotification } from "$models/ApplicantNotification";
import { JobApplicationApplicantNotificationEmailSender } from "../JobApplicationApplicantNotificationEmailSender";

export const RejectedJobApplicationApplicantNotificationEmailSender = {
  send: async (notification: RejectedJobApplicationApplicantNotification) =>
    JobApplicationApplicantNotificationEmailSender.send({
      notification,
      emailTranslationGroup: "rejectedJobApplicationApplicantNotificationEmail"
    })
};
