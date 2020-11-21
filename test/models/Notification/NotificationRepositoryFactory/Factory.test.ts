import {
  CompanyNewJobApplicationNotification,
  CompanyNotificationRepository
} from "$models/CompanyNotification";
import { NotificationRepositoryFactory } from "$models/Notification";
import { UUID } from "$models/UUID";

describe("NotificationRepositoryFactory", () => {
  it("returns a CompanyNotificationRepository for CompanyNewJobApplicationNotification", async () => {
    const notification = new CompanyNewJobApplicationNotification({
      moderatorUuid: UUID.generate(),
      notifiedCompanyUuid: UUID.generate(),
      jobApplicationUuid: UUID.generate()
    });
    const repository = NotificationRepositoryFactory.getRepositoryFor(notification);
    expect(repository).toEqual(CompanyNotificationRepository);
  });

  it("throws an error if the given any object that has no associated repository", async () => {
    expect(() => NotificationRepositoryFactory.getRepositoryFor(new Date() as any)).toThrowError(
      "no repository found for Date"
    );
  });
});
