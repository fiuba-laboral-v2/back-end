import { TNotification } from "$models/Notification/Model";
import { CompanyNewJobApplicationNotification } from "$models/CompanyNotification";
import { CompanyNewJobApplicationEmailSender } from "$services/EmailSender";

export const EmailSenderFactory = {
  create: (notification: TNotification) => {
    const className = notification.constructor.name;
    const emailSender = {
      [CompanyNewJobApplicationNotification.name]: CompanyNewJobApplicationEmailSender
    }[className];
    if (!emailSender) throw new Error(`no emailSender found for ${className}`);

    return emailSender;
  }
};
