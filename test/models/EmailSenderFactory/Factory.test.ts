import { NewJobApplicationCompanyNotification } from "$models/CompanyNotification";
import { UUID } from "$models/UUID";
import { EmailSenderFactory } from "$models/EmailSenderFactory";
import { NewJobApplicationCompanyNotificationEmailSender } from "$services/EmailSender";

describe("EmailSenderFactory", () => {
  it("returns a NewJobApplicationCompanyNotificationEmailSender", async () => {
    const notification = new NewJobApplicationCompanyNotification({
      moderatorUuid: UUID.generate(),
      notifiedCompanyUuid: UUID.generate(),
      jobApplicationUuid: UUID.generate()
    });
    const emailSender = EmailSenderFactory.create(notification);
    expect(emailSender).toBe(NewJobApplicationCompanyNotificationEmailSender);
  });

  it("throws an error if the factory does not know how to handle the given class", async () => {
    expect(() => EmailSenderFactory.create(new Date() as any)).toThrowError(
      "no emailSender found for Date"
    );
  });
});
