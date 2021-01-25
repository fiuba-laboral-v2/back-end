import { User } from "$models/User";
import { EmailService } from "$services";
import { Sender } from "$services/EmailSender/Sender";
import { FrontEndLinksBuilder } from "$services/EmailSender/FrontEndLinksBuilder";
import { TranslationRepository } from "$models/Translation";
import { template } from "lodash";
import { JWT } from "$src/JWT";

export const PasswordRecoveryEmailSender = {
  send: async (user: User) => {
    const { subject, body } = TranslationRepository.translate("passwordRecoveryEmail");
    const token = await JWT.createToken(user, "recoverPassword");

    await EmailService.send({
      params: {
        receiverEmails: [user.email],
        sender: Sender.noReply(),
        subject,
        body: template(body)({
          passwordRecoveryLink: FrontEndLinksBuilder.company.editMyForgottenPassword(token)
        })
      }
    });
  }
};
