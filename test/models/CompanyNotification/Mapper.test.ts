import {
  CompanyNewJobApplicationNotification,
  CompanyNotificationMapper,
  CompanyNotificationType,
  TCompanyNotification
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
        isNew: true
      };

      const notification = new CompanyNewJobApplicationNotification(attributes);
      const persistenceModel = CompanyNotificationMapper.toPersistenceModel(notification);
      expect(persistenceModel).toBeInstanceOf(CompanyNotification);
      expect(persistenceModel.createdAt).toEqual(undefined);
      expect(persistenceModel.uuid).toEqual(null);
      expect(persistenceModel).toBeObjectContaining({
        ...attributes,
        type: CompanyNotificationType.newJobApplication,
        moderatorMessage: undefined
      });
    });

    it("maps a CompanyNewJobApplicationNotification that has already an uuid", async () => {
      const notification = new CompanyNewJobApplicationNotification({
        moderatorUuid: UuidGenerator.generate(),
        notifiedCompanyUuid: UuidGenerator.generate(),
        jobApplicationUuid: UuidGenerator.generate(),
        isNew: true
      });
      const uuid = UuidGenerator.generate();
      notification.setUuid(uuid);
      const persistenceModel = CompanyNotificationMapper.toPersistenceModel(notification);
      expect(persistenceModel.uuid).toEqual(uuid);
    });

    it("maps a CompanyNewJobApplicationNotification that has already a createdAt", async () => {
      const notification = new CompanyNewJobApplicationNotification({
        moderatorUuid: UuidGenerator.generate(),
        notifiedCompanyUuid: UuidGenerator.generate(),
        jobApplicationUuid: UuidGenerator.generate(),
        isNew: true
      });
      const createdAt = new Date();
      notification.setCreatedAt(createdAt);
      const persistenceModel = CompanyNotificationMapper.toPersistenceModel(notification);
      expect(persistenceModel.createdAt).toEqual(createdAt);
    });

    it("throws an error it the given object cannot be mapped", async () => {
      expect(() =>
        CompanyNotificationMapper.toPersistenceModel(
          (new Error() as unknown) as TCompanyNotification
        )
      ).toThrowError("Could no map to a persistence model");
    });
  });

  describe("toDomainModel", () => {
    it("returns a CompanyNewJobApplicationNotification", () => {
      const attributes = {
        uuid: UuidGenerator.generate(),
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
