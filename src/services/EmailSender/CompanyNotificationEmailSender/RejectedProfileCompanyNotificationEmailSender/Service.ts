import { FrontEndLinksBuilder } from "$services/EmailSender/FrontEndLinksBuilder";
import { RejectedProfileCompanyNotification } from "$models/CompanyNotification";
import { CompanyNotificationEmailSender } from "..";

export const RejectedProfileCompanyNotificationEmailSender = {
  send: async (notification: RejectedProfileCompanyNotification) => {
    const bodyTemplate = (signature: string) => ({
      profileLink: FrontEndLinksBuilder.company.profileLink(),
      rejectionReason: notification.moderatorMessage,
      signature
    });

    return CompanyNotificationEmailSender.send(
      notification,
      bodyTemplate,
      "rejectedProfileCompanyNotificationEmail"
    );
  }
};
