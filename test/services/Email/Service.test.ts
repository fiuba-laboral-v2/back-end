import { EmailApi, EmailService } from "$services/Email";
import { ISendEmail } from "$services/Email/interface";
import { isEqual } from "lodash";

describe("EmailService", () => {
  describe("send", () => {
    it("calls EmailApi", () => {
      let sendWasCalled = false;
      const sendEmailParams: ISendEmail = {
        sender: {
          name: "sebastian@blanco.com",
          email: "manuel@llauro.com"
        },
        receiverEmails: ["dylan@alvarez.com"],
        subject: "New Email",
        body: "I'm sending an email"
      };
      jest.spyOn(EmailApi, "send").mockImplementation(async params => {
        sendWasCalled = isEqual(params, sendEmailParams);
      });
      EmailService.send(sendEmailParams);
      expect(sendWasCalled).toBe(true);
    });
  });
});
