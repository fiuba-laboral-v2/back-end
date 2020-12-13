import { Notification } from "$models/Notification/Model";
import {
  NewJobApplicationCompanyNotification,
  ApprovedOfferCompanyNotification,
  RejectedOfferCompanyNotification
} from "$models/CompanyNotification";
import {
  ApprovedJobApplicationApplicantNotification,
  RejectedJobApplicationApplicantNotification,
  ApprovedProfileApplicantNotification
} from "$models/ApplicantNotification";
import {
  NewJobApplicationCompanyNotificationEmailSender,
  ApprovedOfferCompanyNotificationEmailSender,
  RejectedOfferCompanyNotificationEmailSender,
  ApprovedJobApplicationApplicantNotificationEmailSender,
  RejectedJobApplicationApplicantNotificationEmailSender,
  ApprovedProfileApplicantNotificationEmailSender
} from "$services/EmailSender";
import { UnknownEmailSenderError } from "./Errors";

export const EmailSenderFactory = {
  create: (notification: Notification): IEmailSenderFactory => {
    const className = notification.constructor.name;
    const emailSender = {
      [NewJobApplicationCompanyNotification.name]: NewJobApplicationCompanyNotificationEmailSender,
      [ApprovedOfferCompanyNotification.name]: ApprovedOfferCompanyNotificationEmailSender,
      [ApprovedJobApplicationApplicantNotification.name]: ApprovedJobApplicationApplicantNotificationEmailSender,
      [RejectedJobApplicationApplicantNotification.name]: RejectedJobApplicationApplicantNotificationEmailSender,
      [RejectedOfferCompanyNotification.name]: RejectedOfferCompanyNotificationEmailSender,
      [ApprovedProfileApplicantNotification.name]: ApprovedProfileApplicantNotificationEmailSender
    }[className];
    if (!emailSender) throw new UnknownEmailSenderError(className);

    return emailSender;
  }
};

interface IEmailSenderFactory {
  send: (notifications: Notification) => Promise<void>;
}
