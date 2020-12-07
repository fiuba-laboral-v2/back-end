import {
  ApprovedOfferCompanyNotification,
  NewJobApplicationCompanyNotification,
  CompanyNotificationMapper,
  CompanyNotificationType,
  CompanyNotification
} from "$models/CompanyNotification";
import { UUID } from "$models/UUID";
import { CompanyNotificationSequelizeModel } from "$models";
import { NotificationMapperAssertions } from "$test/models/Notification/NotificationMapperAssertions";

describe("CompanyNotificationMapper", () => {
  const mapper = CompanyNotificationMapper;

  describe("toPersistenceModel", () => {
    const {
      expectToNotToBeANewRecord,
      expectToMapTheCreatedAtTimestamp
    } = NotificationMapperAssertions;

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
    const approvedOfferNotification = new ApprovedOfferCompanyNotification(approvedOfferAttributes);

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

    it("maps a ApprovedOfferCompanyNotification", async () => {
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
      expectToNotToBeANewRecord(mapper, newApplicationNotification);
    });

    it("maps a ApprovedOfferCompanyNotification that has already an uuid", async () => {
      expectToNotToBeANewRecord(mapper, approvedOfferNotification);
    });

    it("maps a ApprovedOfferCompanyNotification that has already a createdAt", async () => {
      expectToMapTheCreatedAtTimestamp(mapper, approvedOfferNotification);
    });

    it("maps a NewJobApplicationCompanyNotification that has already a createdAt", async () => {
      expectToMapTheCreatedAtTimestamp(mapper, newApplicationNotification);
    });

    it("throws an error it the given object cannot be mapped", async () => {
      const unknownNotification = (new Error() as unknown) as CompanyNotification;
      expect(() => CompanyNotificationMapper.toPersistenceModel(unknownNotification)).toThrowError(
        "Could not map to a persistence model"
      );
    });
  });

  describe("toDomainModel", () => {
    const { expectToMapPersistenceModelToTheGivenNotification } = NotificationMapperAssertions;

    const commonAttributes = {
      uuid: UUID.generate(),
      moderatorUuid: UUID.generate(),
      notifiedCompanyUuid: UUID.generate(),
      isNew: false,
      createdAt: new Date()
    };

    it("returns a NewJobApplicationCompanyNotification", () => {
      const attributes = {
        ...commonAttributes,
        jobApplicationUuid: UUID.generate(),
        type: CompanyNotificationType.newJobApplication
      };
      const sequelizeModel = new CompanyNotificationSequelizeModel(attributes);
      expectToMapPersistenceModelToTheGivenNotification({
        mapper,
        sequelizeModel,
        attributes,
        modelClass: NewJobApplicationCompanyNotification
      });
    });

    it("returns a ApprovedOfferCompanyNotification", () => {
      const attributes = {
        ...commonAttributes,
        offerUuid: UUID.generate(),
        type: CompanyNotificationType.approvedOffer
      };
      const sequelizeModel = new CompanyNotificationSequelizeModel(attributes);
      expectToMapPersistenceModelToTheGivenNotification({
        mapper,
        sequelizeModel,
        attributes,
        modelClass: ApprovedOfferCompanyNotification
      });
    });
  });
});
