import {
  CompanyNewJobApplicationNotification,
  CompanyNotificationMapper,
  CompanyNotificationType,
  TCompanyNotification
} from "$models/CompanyNotification";
import { UUID } from "$models/UUID";
import { CompanyNotification } from "$models";
import { omit } from "lodash";

describe("CompanyNotificationMapper", () => {
  describe("toPersistenceModel", () => {
    it("maps a CompanyNewJobApplicationNotification", async () => {
      const attributes = {
        moderatorUuid: UUID.generate(),
        notifiedCompanyUuid: UUID.generate(),
        jobApplicationUuid: UUID.generate(),
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
        moderatorMessage: undefined,
        isNewRecord: true
      });
    });

    it("maps a CompanyNewJobApplicationNotification that has already an uuid", async () => {
      const uuid = UUID.generate();
      const notification = new CompanyNewJobApplicationNotification({
        uuid,
        moderatorUuid: UUID.generate(),
        notifiedCompanyUuid: UUID.generate(),
        jobApplicationUuid: UUID.generate(),
        isNew: true
      });
      const persistenceModel = CompanyNotificationMapper.toPersistenceModel(notification);
      expect(persistenceModel.uuid).toEqual(uuid);
      expect(persistenceModel.isNewRecord).toBe(false);
    });

    it("maps a CompanyNewJobApplicationNotification that has already a createdAt", async () => {
      const createdAt = new Date();
      const notification = new CompanyNewJobApplicationNotification({
        moderatorUuid: UUID.generate(),
        notifiedCompanyUuid: UUID.generate(),
        jobApplicationUuid: UUID.generate(),
        isNew: true,
        createdAt
      });
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
        uuid: UUID.generate(),
        moderatorUuid: UUID.generate(),
        type: CompanyNotificationType.newJobApplication,
        notifiedCompanyUuid: UUID.generate(),
        isNew: false,
        jobApplicationUuid: UUID.generate(),
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
