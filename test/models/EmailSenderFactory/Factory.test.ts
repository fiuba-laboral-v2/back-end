import { UpdatedCompanyProfileAdminNotification } from "$models/AdminNotification";
import {
  ApprovedJobApplicationApplicantNotification,
  ApprovedProfileApplicantNotification,
  PendingJobApplicationApplicantNotification,
  RejectedJobApplicationApplicantNotification,
  RejectedProfileApplicantNotification
} from "$models/ApplicantNotification";
import {
  ApprovedOfferCompanyNotification,
  ApprovedProfileCompanyNotification,
  NewJobApplicationCompanyNotification,
  RejectedOfferCompanyNotification,
  RejectedProfileCompanyNotification
} from "$models/CompanyNotification";
import { EmailSenderFactory, UnknownEmailSenderError } from "$models/EmailSenderFactory";
import {
  ApprovedJobApplicationApplicantNotificationEmailSender,
  ApprovedOfferCompanyNotificationEmailSender,
  ApprovedProfileApplicantNotificationEmailSender,
  ApprovedProfileCompanyNotificationEmailSender,
  NewJobApplicationCompanyNotificationEmailSender,
  PendingJobApplicationApplicantNotificationEmailSender,
  RejectedJobApplicationApplicantNotificationEmailSender,
  RejectedOfferCompanyNotificationEmailSender,
  RejectedProfileApplicantNotificationEmailSender,
  RejectedProfileCompanyNotificationEmailSender,
  UpdatedCompanyProfileAdminNotificationEmailSender
} from "$services/EmailSender";
import { UUID } from "$models/UUID";
import { Secretary } from "$models/Admin";

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
      offerUuid: UUID.generate(),
      secretary: Secretary.extension
    });
    const emailSender = EmailSenderFactory.create(notification);
    expect(emailSender).toBe(ApprovedOfferCompanyNotificationEmailSender);
  });

  it("returns a PendingJobApplicationApplicantNotificationEmailSender", async () => {
    const notification = new PendingJobApplicationApplicantNotification({
      moderatorUuid: UUID.generate(),
      notifiedApplicantUuid: UUID.generate(),
      jobApplicationUuid: UUID.generate()
    });
    const emailSender = EmailSenderFactory.create(notification);
    expect(emailSender).toBe(PendingJobApplicationApplicantNotificationEmailSender);
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

  it("returns a ApprovedProfileApplicantNotificationEmailSender", async () => {
    const notification = new ApprovedProfileApplicantNotification({
      moderatorUuid: UUID.generate(),
      notifiedApplicantUuid: UUID.generate()
    });
    const emailSender = EmailSenderFactory.create(notification);
    expect(emailSender).toBe(ApprovedProfileApplicantNotificationEmailSender);
  });

  it("returns a RejectedProfileApplicantNotificationEmailSender", async () => {
    const notification = new RejectedProfileApplicantNotification({
      moderatorUuid: UUID.generate(),
      notifiedApplicantUuid: UUID.generate(),
      moderatorMessage: "message"
    });
    const emailSender = EmailSenderFactory.create(notification);
    expect(emailSender).toBe(RejectedProfileApplicantNotificationEmailSender);
  });

  it("returns a ApprovedProfileCompanyNotificationEmailSender", async () => {
    const notification = new ApprovedProfileCompanyNotification({
      moderatorUuid: UUID.generate(),
      notifiedCompanyUuid: UUID.generate()
    });
    const emailSender = EmailSenderFactory.create(notification);
    expect(emailSender).toBe(ApprovedProfileCompanyNotificationEmailSender);
  });

  it("returns a RejectedProfileCompanyNotificationEmailSender", async () => {
    const notification = new RejectedProfileCompanyNotification({
      moderatorUuid: UUID.generate(),
      notifiedCompanyUuid: UUID.generate(),
      moderatorMessage: "message"
    });
    const emailSender = EmailSenderFactory.create(notification);
    expect(emailSender).toBe(RejectedProfileCompanyNotificationEmailSender);
  });

  it("returns a UpdatedCompanyProfileAdminNotificationEmailSender", async () => {
    const notification = new UpdatedCompanyProfileAdminNotification({
      companyUuid: UUID.generate(),
      secretary: Secretary.graduados
    });
    const emailSender = EmailSenderFactory.create(notification);
    expect(emailSender).toBe(UpdatedCompanyProfileAdminNotificationEmailSender);
  });

  it("throws an error if the factory does not know how to handle the given class", async () => {
    expect(() => EmailSenderFactory.create(new Date() as any)).toThrowErrorWithMessage(
      UnknownEmailSenderError,
      UnknownEmailSenderError.buildMessage(Date.name)
    );
  });
});
