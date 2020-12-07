import {
  ApplicantNotificationMapper,
  ApprovedJobApplicationApplicantNotification,
  ApplicantNotificationType
} from "$models/ApplicantNotification";
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

    const approvedJobApplicationAttributes = {
      ...commonAttributes,
      jobApplicationUuid: UUID.generate()
    };

    const approvedJobApplicationNotification = new ApprovedJobApplicationApplicantNotification(
      approvedJobApplicationAttributes
    );

    it("maps a ApprovedJobApplicationApplicantNotification", async () => {
      const persistenceModel = mapper.toPersistenceModel(approvedJobApplicationNotification);
      expect(persistenceModel).toBeInstanceOf(ApplicantNotificationSequelizeModel);
      expect(persistenceModel).toBeObjectContaining({
        uuid: null,
        ...approvedJobApplicationAttributes,
        type: ApplicantNotificationType.approvedJobApplication,
        moderatorMessage: undefined,
        isNewRecord: true,
        createdAt: undefined
      });
    });

    it("maps a ApprovedJobApplicationApplicantNotification that has already an uuid", async () => {
      expectToNotToBeANewRecord(mapper, approvedJobApplicationNotification);
    });

    it("maps a ApprovedJobApplicationApplicantNotification that has already a createdAt", async () => {
      expectToMapTheCreatedAtTimestamp(mapper, approvedJobApplicationNotification);
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
  });
});
