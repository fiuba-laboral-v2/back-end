import { Notification } from "$models/Notification/Model";
import {
  NewJobApplicationCompanyNotification,
  ApprovedOfferCompanyNotification
} from "$models/CompanyNotification";
import { ApprovedJobApplicationApplicantNotification } from "$models/ApplicantNotification";
import {
  NewJobApplicationCompanyNotificationEmailSender,
  ApprovedOfferCompanyNotificationEmailSender,
  ApprovedJobApplicationApplicantNotificationEmailSender
} from "$services/EmailSender";

export const EmailSenderFactory = {
  create: (notification: Notification): IEmailSenderFactory => {
    const className = notification.constructor.name;
    const emailSender = {
      [NewJobApplicationCompanyNotification.name]: NewJobApplicationCompanyNotificationEmailSender,
      [ApprovedOfferCompanyNotification.name]: ApprovedOfferCompanyNotificationEmailSender,
      [ApprovedJobApplicationApplicantNotification.name]: ApprovedJobApplicationApplicantNotificationEmailSender
    }[className];
    if (!emailSender) throw new Error(`no emailSender found for ${className}`);

    return emailSender;
  }
};

interface IEmailSenderFactory {
  send: (notifications: Notification) => Promise<void>;
}
