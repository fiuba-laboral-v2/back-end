import {
  CompanyNewJobApplicationNotification,
  CompanyNotificationMapper,
  CompanyNotificationType
} from "$models/CompanyNotification";
import { UuidGenerator } from "$models/UuidGenerator";
import { CompanyNotification } from "$models";
import { omit } from "lodash";

describe("CompanyNotificationMapper", () => {
  describe("toPersistenceModel", () => {
    it("maps a CompanyNewJobApplicationNotification", async () => {
      const attributes = {
        moderatorUuid: UuidGenerator.generate(),
        notifiedCompanyUuid: UuidGenerator.generate(),
        jobApplicationUuid: UuidGenerator.generate(),
        isNew: true,
        createdAt: new Date()
      };

      const notification = new CompanyNewJobApplicationNotification(attributes);
      const persistenceModel = CompanyNotificationMapper.toPersistenceModel(notification);
      expect(persistenceModel).toBeInstanceOf(CompanyNotification);
      expect(persistenceModel).toBeObjectContaining({
        uuid: notification.uuid,
        ...attributes,
        type: CompanyNotificationType.newJobApplication,
        moderatorMessage: undefined
      });
    });
  });

  describe("toDomainModel", () => {
    it("returns a CompanyNewJobApplicationNotification", () => {
      const attributes = {
        moderatorUuid: UuidGenerator.generate(),
        type: CompanyNotificationType.newJobApplication,
        notifiedCompanyUuid: UuidGenerator.generate(),
        isNew: false,
        jobApplicationUuid: UuidGenerator.generate(),
        createdAt: new Date()
      };
      const companyNotification = new CompanyNotification(attributes);
      const notification = CompanyNotificationMapper.toDomainModel(companyNotification);
      expect(notification).toBeInstanceOf(CompanyNewJobApplicationNotification);
      expect(notification).toEqual({
        uuid: companyNotification.uuid,
        ...omit(attributes, "type")
      });
    });
  });
});
