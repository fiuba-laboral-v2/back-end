import {
  ApprovedOfferCompanyNotification,
  NewJobApplicationCompanyNotification,
  RejectedOfferCompanyNotification,
  ApprovedProfileCompanyNotification,
  RejectedProfileCompanyNotification,
  CompanyNotificationMapper,
  CompanyNotificationType,
  CompanyNotification
} from "$models/CompanyNotification";
import { UnknownNotificationError } from "$models/Notification";
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

    describe("NewJobApplicationCompanyNotification", () => {
      const attributes = { ...commonAttributes, jobApplicationUuid: UUID.generate() };
      const notification = new NewJobApplicationCompanyNotification(attributes);

      it("returns an instance of CompanyNotificationSequelizeModel", async () => {
        const persistenceModel = mapper.toPersistenceModel(notification);
        expect(persistenceModel).toBeInstanceOf(CompanyNotificationSequelizeModel);
      });

      it("returns a SequelizeModel with the correct attributes", async () => {
        const persistenceModel = mapper.toPersistenceModel(notification);
        expect(persistenceModel).toBeObjectContaining({
          uuid: null,
          ...attributes,
          type: CompanyNotificationType.newJobApplication,
          moderatorMessage: undefined,
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

    describe("ApprovedOfferCompanyNotification", () => {
      const attributes = { ...commonAttributes, offerUuid: UUID.generate() };
      const notification = new ApprovedOfferCompanyNotification(attributes);

      it("returns an instance of CompanyNotificationSequelizeModel", async () => {
        const persistenceModel = mapper.toPersistenceModel(notification);
        expect(persistenceModel).toBeInstanceOf(CompanyNotificationSequelizeModel);
      });

      it("returns a SequelizeModel with the correct attributes", async () => {
        const persistenceModel = mapper.toPersistenceModel(notification);
        expect(persistenceModel).toBeObjectContaining({
          uuid: null,
          ...attributes,
          type: CompanyNotificationType.approvedOffer,
          moderatorMessage: undefined,
          isNewRecord: true,
          createdAt: undefined
        });
      });

      it("maps a notification that has already an uuid", async () => {
        expectToNotToBeANewRecord(mapper, notification);
      });

      it("maps a notification that has already a createdAt", async () => {
        expectToMapTheCreatedAtTimestamp(mapper, notification);
      });
    });

    describe("RejectedOfferCompanyNotification", () => {
      const attributes = {
        ...commonAttributes,
        offerUuid: UUID.generate(),
        moderatorMessage: "message"
      };
      const notification = new RejectedOfferCompanyNotification(attributes);

      it("returns an instance of CompanyNotificationSequelizeModel", async () => {
        const persistenceModel = mapper.toPersistenceModel(notification);
        expect(persistenceModel).toBeInstanceOf(CompanyNotificationSequelizeModel);
      });

      it("returns a SequelizeModel with the correct attributes", async () => {
        const persistenceModel = mapper.toPersistenceModel(notification);
        expect(persistenceModel).toBeObjectContaining({
          uuid: null,
          ...attributes,
          type: CompanyNotificationType.rejectedOffer,
          isNewRecord: true,
          createdAt: undefined
        });
      });

      it("maps a notification that has already an uuid", async () => {
        expectToNotToBeANewRecord(mapper, notification);
      });

      it("maps a notification that has already a createdAt", async () => {
        expectToMapTheCreatedAtTimestamp(mapper, notification);
      });
    });

    describe("ApprovedProfileCompanyNotification", () => {
      const attributes = commonAttributes;
      const notification = new ApprovedProfileCompanyNotification(attributes);

      it("returns an instance of CompanyNotificationSequelizeModel", async () => {
        const persistenceModel = mapper.toPersistenceModel(notification);
        expect(persistenceModel).toBeInstanceOf(CompanyNotificationSequelizeModel);
      });

      it("returns a SequelizeModel with the correct attributes", async () => {
        const persistenceModel = mapper.toPersistenceModel(notification);
        expect(persistenceModel).toBeObjectContaining({
          uuid: null,
          ...attributes,
          type: CompanyNotificationType.approvedProfile,
          isNewRecord: true,
          createdAt: undefined
        });
      });

      it("maps a notification that has already an uuid", async () => {
        expectToNotToBeANewRecord(mapper, notification);
      });

      it("maps a notification that has already a createdAt", async () => {
        expectToMapTheCreatedAtTimestamp(mapper, notification);
      });
    });

    describe("RejectedProfileCompanyNotification", () => {
      const attributes = { ...commonAttributes, moderatorMessage: "message" };
      const notification = new RejectedProfileCompanyNotification(attributes);

      it("returns an instance of CompanyNotificationSequelizeModel", async () => {
        const persistenceModel = mapper.toPersistenceModel(notification);
        expect(persistenceModel).toBeInstanceOf(CompanyNotificationSequelizeModel);
      });

      it("returns a SequelizeModel with the correct attributes", async () => {
        const persistenceModel = mapper.toPersistenceModel(notification);
        expect(persistenceModel).toBeObjectContaining({
          uuid: null,
          ...attributes,
          type: CompanyNotificationType.rejectedProfile,
          isNewRecord: true,
          createdAt: undefined
        });
      });

      it("maps a notification that has already an uuid", async () => {
        expectToNotToBeANewRecord(mapper, notification);
      });

      it("maps a notification that has already a createdAt", async () => {
        expectToMapTheCreatedAtTimestamp(mapper, notification);
      });
    });

    it("throws an error it the given object cannot be mapped", async () => {
      const unknownNotification = (new Date() as unknown) as CompanyNotification;
      expect(() => mapper.toPersistenceModel(unknownNotification)).toThrowErrorWithMessage(
        UnknownNotificationError,
        UnknownNotificationError.buildMessage("Date")
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

    it("returns a ApprovedOfferCompanyNotification", async () => {
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

    it("returns a RejectedOfferCompanyNotification", async () => {
      const attributes = {
        ...commonAttributes,
        offerUuid: UUID.generate(),
        type: CompanyNotificationType.rejectedOffer,
        moderatorMessage: "message"
      };
      const sequelizeModel = new CompanyNotificationSequelizeModel(attributes);
      expectToMapPersistenceModelToTheGivenNotification({
        mapper,
        sequelizeModel,
        attributes,
        modelClass: RejectedOfferCompanyNotification
      });
    });

    it("returns a ApprovedProfileCompanyNotification", async () => {
      const attributes = {
        ...commonAttributes,
        type: CompanyNotificationType.approvedProfile
      };
      const sequelizeModel = new CompanyNotificationSequelizeModel(attributes);
      expectToMapPersistenceModelToTheGivenNotification({
        mapper,
        sequelizeModel,
        attributes,
        modelClass: ApprovedProfileCompanyNotification
      });
    });

    it("returns a RejectedProfileCompanyNotification", async () => {
      const attributes = {
        ...commonAttributes,
        type: CompanyNotificationType.rejectedProfile,
        moderatorMessage: "message"
      };
      const sequelizeModel = new CompanyNotificationSequelizeModel(attributes);
      expectToMapPersistenceModelToTheGivenNotification({
        mapper,
        sequelizeModel,
        attributes,
        modelClass: RejectedProfileCompanyNotification
      });
    });
  });
});
