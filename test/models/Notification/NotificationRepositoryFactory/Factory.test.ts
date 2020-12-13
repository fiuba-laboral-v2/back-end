import {
  ApplicantNotificationRepository,
  ApprovedJobApplicationApplicantNotification,
  RejectedJobApplicationApplicantNotification,
  ApprovedProfileApplicantNotification
} from "$models/ApplicantNotification";
import {
  NewJobApplicationCompanyNotification,
  ApprovedOfferCompanyNotification,
  RejectedOfferCompanyNotification,
  CompanyNotificationRepository
} from "$models/CompanyNotification";
import { NotificationRepositoryFactory, UnknownRepositoryError } from "$models/Notification";
import { UUID } from "$models/UUID";

describe("NotificationRepositoryFactory", () => {
  it("returns a CompanyNotificationRepository for NewJobApplicationCompanyNotification", async () => {
    const notification = new NewJobApplicationCompanyNotification({
      moderatorUuid: UUID.generate(),
      notifiedCompanyUuid: UUID.generate(),
      jobApplicationUuid: UUID.generate()
    });
    const repository = NotificationRepositoryFactory.getRepositoryFor(notification);
    expect(repository).toEqual(CompanyNotificationRepository);
  });

  it("returns a CompanyNotificationRepository for ApprovedOfferCompanyNotification", async () => {
    const notification = new ApprovedOfferCompanyNotification({
      moderatorUuid: UUID.generate(),
      notifiedCompanyUuid: UUID.generate(),
      offerUuid: UUID.generate()
    });
    const repository = NotificationRepositoryFactory.getRepositoryFor(notification);
    expect(repository).toEqual(CompanyNotificationRepository);
  });

  it("returns a CompanyNotificationRepository for RejectedOfferCompanyNotification", async () => {
    const notification = new RejectedOfferCompanyNotification({
      moderatorUuid: UUID.generate(),
      notifiedCompanyUuid: UUID.generate(),
      offerUuid: UUID.generate(),
      moderatorMessage: "message"
    });
    const repository = NotificationRepositoryFactory.getRepositoryFor(notification);
    expect(repository).toEqual(CompanyNotificationRepository);
  });

  it("returns an ApplicantNotificationRepository for ApprovedJobApplicationApplicantNotification", async () => {
    const notification = new ApprovedJobApplicationApplicantNotification({
      moderatorUuid: UUID.generate(),
      notifiedApplicantUuid: UUID.generate(),
      jobApplicationUuid: UUID.generate()
    });
    const repository = NotificationRepositoryFactory.getRepositoryFor(notification);
    expect(repository).toEqual(ApplicantNotificationRepository);
  });

  it("returns an ApplicantNotificationRepository for RejectedJobApplicationApplicantNotification", async () => {
    const notification = new RejectedJobApplicationApplicantNotification({
      moderatorUuid: UUID.generate(),
      notifiedApplicantUuid: UUID.generate(),
      jobApplicationUuid: UUID.generate(),
      moderatorMessage: "message"
    });
    const repository = NotificationRepositoryFactory.getRepositoryFor(notification);
    expect(repository).toEqual(ApplicantNotificationRepository);
  });

  it("returns an ApplicantNotificationRepository for ApprovedProfileApplicantNotification", async () => {
    const notification = new ApprovedProfileApplicantNotification({
      moderatorUuid: UUID.generate(),
      notifiedApplicantUuid: UUID.generate()
    });
    const repository = NotificationRepositoryFactory.getRepositoryFor(notification);
    expect(repository).toEqual(ApplicantNotificationRepository);
  });

  it("throws an error if it is given any object that has no associated repository", async () => {
    expect(() =>
      NotificationRepositoryFactory.getRepositoryFor(new Date() as any)
    ).toThrowErrorWithMessage(
      UnknownRepositoryError,
      UnknownRepositoryError.buildMessage(Date.name)
    );
  });
});
