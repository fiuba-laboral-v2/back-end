import {
  CompanyNewJobApplicationNotification,
  CompanyNotificationMapper,
  CompanyNotificationType,
  TCompanyNotification
} from "$models/CompanyNotification";
import { v4 as generateUuid } from "uuid";
import { CompanyNotification } from "$models";
import { omit } from "lodash";

describe("CompanyNotificationMapper", () => {
  describe("toPersistenceModel", () => {
    it("maps a CompanyNewJobApplicationNotification", async () => {
      const attributes = {
        moderatorUuid: generateUuid(),
        notifiedCompanyUuid: generateUuid(),
        jobApplicationUuid: generateUuid(),
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
        moderatorUuid: generateUuid(),
        notifiedCompanyUuid: generateUuid(),
        jobApplicationUuid: generateUuid(),
        isNew: true
      });
      const uuid = generateUuid();
      notification.setUuid(uuid);
      const persistenceModel = CompanyNotificationMapper.toPersistenceModel(notification);
      expect(persistenceModel.uuid).toEqual(uuid);
    });

    it("maps a CompanyNewJobApplicationNotification that has already a createdAt", async () => {
      const notification = new CompanyNewJobApplicationNotification({
        moderatorUuid: generateUuid(),
        notifiedCompanyUuid: generateUuid(),
        jobApplicationUuid: generateUuid(),
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
        uuid: generateUuid(),
        moderatorUuid: generateUuid(),
        type: CompanyNotificationType.newJobApplication,
        notifiedCompanyUuid: generateUuid(),
        isNew: false,
        jobApplicationUuid: generateUuid(),
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
