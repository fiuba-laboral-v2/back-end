import { ApprovedJobApplicationApplicantNotification } from "$models/ApplicantNotification";
import { JobApplicationApplicantNotificationEmailSender } from "../JobApplicationApplicantNotificationEmailSender";

export const ApprovedJobApplicationApplicantNotificationEmailSender = {
  send: async (notification: ApprovedJobApplicationApplicantNotification) =>
    JobApplicationApplicantNotificationEmailSender.send({
      notification,
      emailTranslationGroup: "approvedJobApplicationApplicantNotificationEmail"
    })
};
