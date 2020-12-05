import {
  NewJobApplicationCompanyNotification,
  ApprovedOfferCompanyNotification,
  CompanyNotificationRepository
} from "$models/CompanyNotification";
import { NotificationRepositoryFactory } from "$models/Notification";
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

  it("throws an error if it is given any object that has no associated repository", async () => {
    expect(() => NotificationRepositoryFactory.getRepositoryFor(new Date() as any)).toThrowError(
      "no repository found for Date"
    );
  });
});
