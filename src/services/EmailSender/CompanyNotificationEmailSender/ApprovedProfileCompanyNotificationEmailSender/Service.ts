import { FrontEndLinksBuilder } from "$services/EmailSender/FrontEndLinksBuilder";
import { ApprovedProfileCompanyNotification } from "$models/CompanyNotification";
import { CompanyNotificationEmailSender } from "..";

export const ApprovedProfileCompanyNotificationEmailSender = {
  send: async (notification: ApprovedProfileCompanyNotification) => {
    const bodyTemplate = (signature: string) => ({
      profileLink: FrontEndLinksBuilder.company.profileLink(),
      signature
    });

    return CompanyNotificationEmailSender.send(
      notification,
      bodyTemplate,
      "approvedProfileCompanyNotificationEmail"
    );
  }
};
