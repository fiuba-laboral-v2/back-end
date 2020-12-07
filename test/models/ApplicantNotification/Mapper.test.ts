import {
  ApplicantNotificationMapper,
  ApprovedJobApplicationApplicantNotification,
  ApplicantNotificationType,
  ApplicantNotification
} from "$models/ApplicantNotification";
import { UUID } from "$models/UUID";
import { ApplicantNotificationSequelizeModel } from "$models";
import { Constructable } from "$test/types/Constructable";
import { omit } from "lodash";

describe("ApplicantNotificationMapper", () => {
  const mapper = ApplicantNotificationMapper;

  describe("toPersistenceModel", () => {
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

    const expectToNotToBeANewRecord = (notification: ApplicantNotification) => {
      const uuid = UUID.generate();
      notification.setUuid(uuid);
      const persistenceModel = mapper.toPersistenceModel(notification);
      expect(persistenceModel.uuid).toEqual(uuid);
      expect(persistenceModel.isNewRecord).toBe(false);
      notification.setUuid(undefined);
    };

    const expectToMapTheCreatedAtTimestamp = (notification: ApplicantNotification) => {
      const createdAt = new Date();
      notification.setCreatedAt(createdAt);
      const persistenceModel = mapper.toPersistenceModel(notification);
      expect(persistenceModel.createdAt).toEqual(createdAt);
      notification.setCreatedAt(undefined);
    };

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
      expectToNotToBeANewRecord(approvedJobApplicationNotification);
    });

    it("maps a ApprovedJobApplicationApplicantNotification that has already a createdAt", async () => {
      expectToMapTheCreatedAtTimestamp(approvedJobApplicationNotification);
    });
  });

  describe("toDomainModel", () => {
    const commonAttributes = {
      uuid: UUID.generate(),
      moderatorUuid: UUID.generate(),
      notifiedApplicantUuid: UUID.generate(),
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
      const sequelizeModel = new ApplicantNotificationSequelizeModel(attributes);
      const notification = mapper.toDomainModel(sequelizeModel);
      expect(notification).toBeInstanceOf(modelClass);
      expect(notification).toEqual({
        uuid: sequelizeModel.uuid,
        ...omit(attributes, "type")
      });
    };

    it("returns a ApprovedJobApplicationApplicantNotification", () => {
      expectToMapPersistenceModelToTheGivenNotification({
        attributes: {
          ...commonAttributes,
          jobApplicationUuid: UUID.generate(),
          type: ApplicantNotificationType.approvedJobApplication
        },
        modelClass: ApprovedJobApplicationApplicantNotification
      });
    });
  });
});
