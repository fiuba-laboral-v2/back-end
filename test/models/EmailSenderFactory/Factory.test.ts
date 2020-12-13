import {
  ApprovedJobApplicationApplicantNotification,
  RejectedJobApplicationApplicantNotification
} from "$models/ApplicantNotification";
import {
  NewJobApplicationCompanyNotification,
  ApprovedOfferCompanyNotification,
  RejectedOfferCompanyNotification
} from "$models/CompanyNotification";
import { EmailSenderFactory, UnknownEmailSenderError } from "$models/EmailSenderFactory";
import {
  NewJobApplicationCompanyNotificationEmailSender,
  ApprovedOfferCompanyNotificationEmailSender,
  RejectedOfferCompanyNotificationEmailSender,
  ApprovedJobApplicationApplicantNotificationEmailSender,
  RejectedJobApplicationApplicantNotificationEmailSender
} from "$services/EmailSender";
import { UUID } from "$models/UUID";

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

  it("returns a ApprovedOfferCompanyNotificationEmailSender", async () => {
    const notification = new ApprovedOfferCompanyNotification({
      moderatorUuid: UUID.generate(),
      notifiedCompanyUuid: UUID.generate(),
      offerUuid: UUID.generate()
    });
    const emailSender = EmailSenderFactory.create(notification);
    expect(emailSender).toBe(ApprovedOfferCompanyNotificationEmailSender);
  });

  it("returns a ApprovedJobApplicationApplicantNotificationEmailSender", async () => {
    const notification = new ApprovedJobApplicationApplicantNotification({
      moderatorUuid: UUID.generate(),
      notifiedApplicantUuid: UUID.generate(),
      jobApplicationUuid: UUID.generate()
    });
    const emailSender = EmailSenderFactory.create(notification);
    expect(emailSender).toBe(ApprovedJobApplicationApplicantNotificationEmailSender);
  });

  it("returns a RejectedJobApplicationApplicantNotificationEmailSender", async () => {
    const notification = new RejectedJobApplicationApplicantNotification({
      moderatorUuid: UUID.generate(),
      notifiedApplicantUuid: UUID.generate(),
      jobApplicationUuid: UUID.generate(),
      moderatorMessage: "message"
    });
    const emailSender = EmailSenderFactory.create(notification);
    expect(emailSender).toBe(RejectedJobApplicationApplicantNotificationEmailSender);
  });

  it("returns a RejectedOfferCompanyNotificationEmailSender", async () => {
    const notification = new RejectedOfferCompanyNotification({
      moderatorUuid: UUID.generate(),
      notifiedCompanyUuid: UUID.generate(),
      offerUuid: UUID.generate(),
      moderatorMessage: "message"
    });
    const emailSender = EmailSenderFactory.create(notification);
    expect(emailSender).toBe(RejectedOfferCompanyNotificationEmailSender);
  });

  it("throws an error if the factory does not know how to handle the given class", async () => {
    expect(() => EmailSenderFactory.create(new Date() as any)).toThrowErrorWithMessage(
      UnknownEmailSenderError,
      UnknownEmailSenderError.buildMessage(Date.name)
    );
  });
});
