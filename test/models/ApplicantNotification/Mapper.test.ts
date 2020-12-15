import {
  ApplicantNotificationMapper,
  ApprovedJobApplicationApplicantNotification,
  RejectedJobApplicationApplicantNotification,
  ApprovedProfileApplicantNotification,
  RejectedProfileApplicantNotification,
  ApplicantNotificationType,
  ApplicantNotification
} from "$models/ApplicantNotification";
import { UnknownNotificationError } from "$models/Notification";
import { UUID } from "$models/UUID";
import { ApplicantNotificationSequelizeModel } from "$models";
import { NotificationMapperAssertions } from "../Notification/NotificationMapperAssertions";

describe("ApplicantNotificationMapper", () => {
  const mapper = ApplicantNotificationMapper;

  describe("toPersistenceModel", () => {
    const {
      expectToNotToBeANewRecord,
      expectToMapTheCreatedAtTimestamp
    } = NotificationMapperAssertions;

    const commonAttributes = {
      moderatorUuid: UUID.generate(),
      notifiedApplicantUuid: UUID.generate(),
      isNew: true
    };

    describe("ApprovedJobApplicationApplicantNotification", () => {
      const attributes = { ...commonAttributes, jobApplicationUuid: UUID.generate() };
      const notification = new ApprovedJobApplicationApplicantNotification(attributes);

      it("returns an instance of ApplicantNotificationSequelizeModel", async () => {
        const persistenceModel = mapper.toPersistenceModel(notification);
        expect(persistenceModel).toBeInstanceOf(ApplicantNotificationSequelizeModel);
      });

      it("returns a SequelizeModel with the correct attributes", async () => {
        const persistenceModel = mapper.toPersistenceModel(notification);
        expect(persistenceModel).toBeObjectContaining({
          uuid: null,
          ...attributes,
          type: ApplicantNotificationType.approvedJobApplication,
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

    describe("RejectedJobApplicationApplicantNotification", () => {
      const attributes = {
        ...commonAttributes,
        jobApplicationUuid: UUID.generate(),
        moderatorMessage: "message"
      };
      const notification = new RejectedJobApplicationApplicantNotification(attributes);

      it("returns an instance of ApplicantNotificationSequelizeModel", async () => {
        const persistenceModel = mapper.toPersistenceModel(notification);
        expect(persistenceModel).toBeInstanceOf(ApplicantNotificationSequelizeModel);
      });

      it("returns a SequelizeModel with the correct attributes", async () => {
        const persistenceModel = mapper.toPersistenceModel(notification);
        expect(persistenceModel).toBeObjectContaining({
          uuid: null,
          ...attributes,
          type: ApplicantNotificationType.rejectedJobApplication,
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

    describe("ApprovedProfileApplicantNotification", () => {
      const attributes = commonAttributes;
      const notification = new ApprovedProfileApplicantNotification(attributes);

      it("returns an instance of ApplicantNotificationSequelizeModel", async () => {
        const persistenceModel = mapper.toPersistenceModel(notification);
        expect(persistenceModel).toBeInstanceOf(ApplicantNotificationSequelizeModel);
      });

      it("returns a SequelizeModel with the correct attributes", async () => {
        const persistenceModel = mapper.toPersistenceModel(notification);
        expect(persistenceModel).toBeObjectContaining({
          uuid: null,
          ...attributes,
          type: ApplicantNotificationType.approvedProfile,
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

    describe("RejectedProfileApplicantNotification", () => {
      const attributes = { ...commonAttributes, moderatorMessage: "message" };
      const notification = new RejectedProfileApplicantNotification(attributes);

      it("returns an instance of ApplicantNotificationSequelizeModel", async () => {
        const persistenceModel = mapper.toPersistenceModel(notification);
        expect(persistenceModel).toBeInstanceOf(ApplicantNotificationSequelizeModel);
      });

      it("returns a SequelizeModel with the correct attributes", async () => {
        const persistenceModel = mapper.toPersistenceModel(notification);
        expect(persistenceModel).toBeObjectContaining({
          uuid: null,
          ...attributes,
          type: ApplicantNotificationType.rejectedProfile,
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

    it("throws an error it the given object cannot be mapped", async () => {
      const unknownNotification = (new Error() as unknown) as ApplicantNotification;
      expect(() => mapper.toPersistenceModel(unknownNotification)).toThrowErrorWithMessage(
        UnknownNotificationError,
        UnknownNotificationError.buildMessage("Error")
      );
    });
  });

  describe("toDomainModel", () => {
    const { expectToMapPersistenceModelToTheGivenNotification } = NotificationMapperAssertions;

    const commonAttributes = {
      uuid: UUID.generate(),
      moderatorUuid: UUID.generate(),
      notifiedApplicantUuid: UUID.generate(),
      isNew: false,
      createdAt: new Date()
    };

    it("returns a ApprovedJobApplicationApplicantNotification", () => {
      const attributes = {
        ...commonAttributes,
        jobApplicationUuid: UUID.generate(),
        type: ApplicantNotificationType.approvedJobApplication
      };
      const sequelizeModel = new ApplicantNotificationSequelizeModel(attributes);
      expectToMapPersistenceModelToTheGivenNotification({
        mapper,
        sequelizeModel,
        attributes,
        modelClass: ApprovedJobApplicationApplicantNotification
      });
    });

    it("returns a RejectedJobApplicationApplicantNotification", () => {
      const attributes = {
        ...commonAttributes,
        jobApplicationUuid: UUID.generate(),
        moderatorMessage: "message",
        type: ApplicantNotificationType.rejectedJobApplication
      };
      const sequelizeModel = new ApplicantNotificationSequelizeModel(attributes);
      expectToMapPersistenceModelToTheGivenNotification({
        mapper,
        sequelizeModel,
        attributes,
        modelClass: RejectedJobApplicationApplicantNotification
      });
    });

    it("returns a ApprovedProfileApplicantNotification", () => {
      const attributes = {
        ...commonAttributes,
        type: ApplicantNotificationType.approvedProfile
      };
      const sequelizeModel = new ApplicantNotificationSequelizeModel(attributes);
      expectToMapPersistenceModelToTheGivenNotification({
        mapper,
        sequelizeModel,
        attributes,
        modelClass: ApprovedProfileApplicantNotification
      });
    });

    it("returns a RejectedProfileApplicantNotification", () => {
      const attributes = {
        ...commonAttributes,
        moderatorMessage: "message",
        type: ApplicantNotificationType.rejectedProfile
      };
      const sequelizeModel = new ApplicantNotificationSequelizeModel(attributes);
      expectToMapPersistenceModelToTheGivenNotification({
        mapper,
        sequelizeModel,
        attributes,
        modelClass: RejectedProfileApplicantNotification
      });
    });
  });
});
