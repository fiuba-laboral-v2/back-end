import { TNotification } from "$models/Notification/Model";
import { NewJobApplicationCompanyNotification } from "$models/CompanyNotification";
import { NewJobApplicationCompanyNotificationEmailSender } from "$services/EmailSender";

export const EmailSenderFactory = {
  create: (notification: TNotification) => {
    const className = notification.constructor.name;
    const emailSender = {
      [NewJobApplicationCompanyNotification.name]: NewJobApplicationCompanyNotificationEmailSender
    }[className];
    if (!emailSender) throw new Error(`no emailSender found for ${className}`);

    return emailSender;
  }
};
