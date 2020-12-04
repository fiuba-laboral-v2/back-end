import {
  CompanyApprovedOfferNotification,
  NewJobApplicationCompanyNotification,
  CompanyNotificationMapper,
  CompanyNotificationType,
  CompanyNotification
} from "$models/CompanyNotification";
import { UUID } from "$models/UUID";
import { CompanyNotificationSequelizeModel } from "$models";
import { omit } from "lodash";
import { Constructable } from "$test/types/Constructable";

describe("CompanyNotificationMapper", () => {
  const mapper = CompanyNotificationMapper;

  describe("toPersistenceModel", () => {
    const commonAttributes = {
      moderatorUuid: UUID.generate(),
      notifiedCompanyUuid: UUID.generate(),
      isNew: true
    };

    const newApplicationAttributes = { ...commonAttributes, jobApplicationUuid: UUID.generate() };
    const approvedOfferAttributes = { ...commonAttributes, offerUuid: UUID.generate() };

    const newApplicationNotification = new NewJobApplicationCompanyNotification(
      newApplicationAttributes
    );
    const approvedOfferNotification = new CompanyApprovedOfferNotification(approvedOfferAttributes);

    const expectToNotToBeANewRecord = (notification: CompanyNotification) => {
      const uuid = UUID.generate();
      notification.setUuid(uuid);
      const persistenceModel = mapper.toPersistenceModel(notification);
      expect(persistenceModel.uuid).toEqual(uuid);
      expect(persistenceModel.isNewRecord).toBe(false);
      notification.setUuid(undefined);
    };

    const expectToMapTheCreatedAtTimestamp = (notification: CompanyNotification) => {
      const createdAt = new Date();
      notification.setCreatedAt(createdAt);
      const persistenceModel = mapper.toPersistenceModel(notification);
      expect(persistenceModel.createdAt).toEqual(createdAt);
      notification.setCreatedAt(undefined);
    };

    it("maps a NewJobApplicationCompanyNotification", async () => {
      const persistenceModel = mapper.toPersistenceModel(newApplicationNotification);
      expect(persistenceModel).toBeInstanceOf(CompanyNotificationSequelizeModel);
      expect(persistenceModel).toBeObjectContaining({
        uuid: null,
        ...newApplicationAttributes,
        type: CompanyNotificationType.newJobApplication,
        moderatorMessage: undefined,
        isNewRecord: true,
        createdAt: undefined
      });
    });

    it("maps a CompanyApprovedOfferNotification", async () => {
      const persistenceModel = mapper.toPersistenceModel(approvedOfferNotification);
      expect(persistenceModel).toBeInstanceOf(CompanyNotificationSequelizeModel);
      expect(persistenceModel).toBeObjectContaining({
        uuid: null,
        ...approvedOfferAttributes,
        type: CompanyNotificationType.approvedOffer,
        moderatorMessage: undefined,
        isNewRecord: true,
        createdAt: undefined
      });
    });

    it("maps a NewJobApplicationCompanyNotification that has already an uuid", async () => {
      expectToNotToBeANewRecord(newApplicationNotification);
    });

    it("maps a CompanyApprovedOfferNotification that has already an uuid", async () => {
      expectToNotToBeANewRecord(approvedOfferNotification);
    });

    it("maps a CompanyApprovedOfferNotification that has already a createdAt", async () => {
      expectToMapTheCreatedAtTimestamp(approvedOfferNotification);
    });

    it("maps a NewJobApplicationCompanyNotification that has already a createdAt", async () => {
      expectToMapTheCreatedAtTimestamp(newApplicationNotification);
    });

    it("throws an error it the given object cannot be mapped", async () => {
      const unknownNotification = (new Error() as unknown) as CompanyNotification;
      expect(() => CompanyNotificationMapper.toPersistenceModel(unknownNotification)).toThrowError(
        "Could not map to a persistence model"
      );
    });
  });

  describe("toDomainModel", () => {
    const commonAttributes = {
      uuid: UUID.generate(),
      moderatorUuid: UUID.generate(),
      notifiedCompanyUuid: UUID.generate(),
      isNew: false,
      createdAt: new Date()
    };

    const expectToMapPersistenceModelToTheGivenNotification = ({
      attributes,
      modelClass
    }: {
      attributes: object;
      modelClass: Constructable;
    }) => {
      const companyNotification = new CompanyNotificationSequelizeModel(attributes);
      const notification = mapper.toDomainModel(companyNotification);
      expect(notification).toBeInstanceOf(modelClass);
      expect(notification).toEqual({
        uuid: companyNotification.uuid,
        ...omit(attributes, "type")
      });
    };

    it("returns a NewJobApplicationCompanyNotification", () => {
      expectToMapPersistenceModelToTheGivenNotification({
        attributes: {
          ...commonAttributes,
          jobApplicationUuid: UUID.generate(),
          type: CompanyNotificationType.newJobApplication
        },
        modelClass: NewJobApplicationCompanyNotification
      });
    });

    it("returns a CompanyApprovedOfferNotification", () => {
      expectToMapPersistenceModelToTheGivenNotification({
        attributes: {
          ...commonAttributes,
          offerUuid: UUID.generate(),
          type: CompanyNotificationType.approvedOffer
        },
        modelClass: CompanyApprovedOfferNotification
      });
    });
  });
});
