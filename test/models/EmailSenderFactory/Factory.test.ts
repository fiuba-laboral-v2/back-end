import { CompanyNewJobApplicationNotification } from "$models/CompanyNotification";
import { UUID } from "$models/UUID";
import { EmailSenderFactory } from "$models/EmailSenderFactory/Factory";
import { CompanyNewJobApplicationEmailSender } from "$services/EmailSender";

describe("EmailSenderFactory", () => {
  it("returns a CompanyNewJobApplicationEmailSender", async () => {
    const notification = new CompanyNewJobApplicationNotification({
      moderatorUuid: UUID.generate(),
      notifiedCompanyUuid: UUID.generate(),
      jobApplicationUuid: UUID.generate()
    });
    const emailSender = EmailSenderFactory.create(notification);
    expect(emailSender).toBe(CompanyNewJobApplicationEmailSender);
  });

  it("throws an error if the factory does not know how to handle the given class", async () => {
    expect(() => EmailSenderFactory.create(new Date() as any)).toThrowError("");
  });
});
