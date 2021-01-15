import {
  AdminNotificationRepository,
  UpdatedCompanyProfileAdminNotification
} from "$models/AdminNotification";
import {
  ApplicantNotificationRepository,
  ApprovedJobApplicationApplicantNotification,
  ApprovedProfileApplicantNotification,
  PendingJobApplicationApplicantNotification,
  RejectedJobApplicationApplicantNotification,
  RejectedProfileApplicantNotification
} from "$models/ApplicantNotification";
import {
  ApprovedOfferCompanyNotification,
  ApprovedProfileCompanyNotification,
  CompanyNotificationRepository,
  NewJobApplicationCompanyNotification,
  RejectedOfferCompanyNotification,
  RejectedProfileCompanyNotification
} from "$models/CompanyNotification";
import { NotificationRepositoryFactory, UnknownRepositoryError } from "$models/Notification";
import { UUID } from "$models/UUID";
import { Secretary } from "$models/Admin";

describe("NotificationRepositoryFactory", () => {
  it("returns a AdminNotificationRepository for UpdatedCompanyProfileAdminNotification", async () => {
    const notification = new UpdatedCompanyProfileAdminNotification({
      secretary: Secretary.graduados,
      companyUuid: UUID.generate()
    });
    const repository = NotificationRepositoryFactory.getRepositoryFor(notification);
    expect(repository).toEqual(AdminNotificationRepository);
  });

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
      offerUuid: UUID.generate(),
      secretary: Secretary.graduados
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

  it("returns a CompanyNotificationRepository for ApprovedProfileCompanyNotification", async () => {
    const notification = new ApprovedProfileCompanyNotification({
      moderatorUuid: UUID.generate(),
      notifiedCompanyUuid: UUID.generate()
    });
    const repository = NotificationRepositoryFactory.getRepositoryFor(notification);
    expect(repository).toEqual(CompanyNotificationRepository);
  });

  it("returns a CompanyNotificationRepository for RejectedProfileCompanyNotification", async () => {
    const notification = new RejectedProfileCompanyNotification({
      moderatorUuid: UUID.generate(),
      notifiedCompanyUuid: UUID.generate(),
      moderatorMessage: "message"
    });
    const repository = NotificationRepositoryFactory.getRepositoryFor(notification);
    expect(repository).toEqual(CompanyNotificationRepository);
  });

  it("returns an ApplicantNotificationRepository for PendingJobApplicationApplicantNotification", async () => {
    const notification = new PendingJobApplicationApplicantNotification({
      moderatorUuid: UUID.generate(),
      notifiedApplicantUuid: UUID.generate(),
      jobApplicationUuid: UUID.generate()
    });
    const repository = NotificationRepositoryFactory.getRepositoryFor(notification);
    expect(repository).toEqual(ApplicantNotificationRepository);
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

  it("returns an ApplicantNotificationRepository for RejectedProfileApplicantNotification", async () => {
    const notification = new RejectedProfileApplicantNotification({
      moderatorUuid: UUID.generate(),
      notifiedApplicantUuid: UUID.generate(),
      moderatorMessage: "message"
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
