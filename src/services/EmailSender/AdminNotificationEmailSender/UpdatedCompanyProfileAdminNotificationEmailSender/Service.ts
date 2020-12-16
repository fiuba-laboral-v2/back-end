import { UpdatedCompanyProfileAdminNotification } from "$models/AdminNotification";
import { TranslationRepository } from "$models/Translation";
import { EmailService } from "$services/Email";
import { Sender } from "$services/EmailSender/Sender";
import { template } from "lodash";
import { FrontEndLinksBuilder } from "$services/EmailSender/FrontEndLinksBuilder";

export const UpdatedCompanyProfileAdminNotificationEmailSender = {
  send: async (notification: UpdatedCompanyProfileAdminNotification) => {
    const { subject, body } = TranslationRepository.translate(
      "updatedCompanyProfileAdminNotificationEmail"
    );

    return EmailService.send({
      receiverEmails: [""],
      sender: Sender.noReply(),
      subject,
      body: template(body)({
        companyLink: FrontEndLinksBuilder.admin.company.profileLink(notification.companyUuid)
      })
    });
  }
};
