import {
  UpdatedCompanyProfileAdminNotification,
  AdminNotificationType,
  AdminNotificationMapper
} from "$models/AdminNotification";
import { AdminNotificationSequelizeModel } from "$models";

import { Secretary } from "$models/Admin";
import { UUID } from "$models/UUID";
import { NotificationMapperAssertions } from "$test/models/Notification/NotificationMapperAssertions";

describe("AdminNotificationMapper", () => {
  const mapper = AdminNotificationMapper;

  describe("toPersistenceModel", () => {
    const {
      expectToNotToBeANewRecord,
      expectToMapTheCreatedAtTimestamp
    } = NotificationMapperAssertions;

    const commonAttributes = { secretary: Secretary.graduados, isNew: true };

    describe("UpdatedCompanyProfileAdminNotification", () => {
      const attributes = { ...commonAttributes, companyUuid: UUID.generate() };
      const notification = new UpdatedCompanyProfileAdminNotification(attributes);

      it("returns an instance of AdminNotificationSequelizeModel", async () => {
        const persistenceModel = mapper.toPersistenceModel(notification);
        expect(persistenceModel).toBeInstanceOf(AdminNotificationSequelizeModel);
      });

      it("returns a SequelizeModel with the correct attributes", async () => {
        const persistenceModel = mapper.toPersistenceModel(notification);
        expect(persistenceModel).toBeObjectContaining({
          uuid: null,
          ...attributes,
          type: AdminNotificationType.updatedCompanyProfile,
          isNewRecord: true,
          createdAt: undefined
        });
      });

      it("maps the notification that has already an uuid", async () => {
        expectToNotToBeANewRecord(mapper, notification);
      });

      it("maps the notification that has already a createdAt", async () => {
        expectToMapTheCreatedAtTimestamp(mapper, notification);
      });
    });
  });

  describe("toDomainModel", () => {
    const { expectToMapPersistenceModelToTheGivenNotification } = NotificationMapperAssertions;

    const commonAttributes = {
      uuid: UUID.generate(),
      secretary: Secretary.extension,
      isNew: false,
      createdAt: new Date()
    };

    it("returns a UpdatedCompanyProfileAdminNotification", () => {
      const attributes = {
        ...commonAttributes,
        type: AdminNotificationType.updatedCompanyProfile,
        companyUuid: UUID.generate()
      };
      const sequelizeModel = new AdminNotificationSequelizeModel(attributes);
      expectToMapPersistenceModelToTheGivenNotification({
        mapper,
        sequelizeModel,
        attributes,
        modelClass: UpdatedCompanyProfileAdminNotification
      });
    });
  });
});
