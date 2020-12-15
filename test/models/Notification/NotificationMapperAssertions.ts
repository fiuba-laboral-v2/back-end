import { UUID } from "$models/UUID";
import { Notification } from "$models/Notification";
import {
  ApplicantNotificationSequelizeModel,
  CompanyNotificationSequelizeModel,
  AdminNotificationSequelizeModel
} from "$models";
import { omit } from "lodash";
import { Constructable } from "$test/types/Constructable";

export const NotificationMapperAssertions = {
  expectToNotToBeANewRecord: (mapper: IMapper, notification: Notification) => {
    const uuid = UUID.generate();
    notification.setUuid(uuid);
    const persistenceModel = mapper.toPersistenceModel(notification);
    expect(persistenceModel.uuid).toEqual(uuid);
    expect(persistenceModel.isNewRecord).toBe(false);
    notification.setUuid(undefined);
  },
  expectToMapTheCreatedAtTimestamp: (mapper: IMapper, notification: Notification) => {
    const createdAt = new Date();
    notification.setCreatedAt(createdAt);
    const persistenceModel = mapper.toPersistenceModel(notification);
    expect(persistenceModel.createdAt).toEqual(createdAt);
    notification.setCreatedAt(undefined);
  },
  expectToMapPersistenceModelToTheGivenNotification: ({
    mapper,
    sequelizeModel,
    attributes,
    modelClass
  }: IExpectToMapPersistenceModelToTheGivenNotification) => {
    const notification = mapper.toDomainModel(sequelizeModel);
    expect(notification).toBeInstanceOf(modelClass);
    expect(notification).toEqual({
      uuid: sequelizeModel.uuid,
      ...omit(attributes, "type")
    });
  }
};

interface IExpectToMapPersistenceModelToTheGivenNotification {
  sequelizeModel: SequelizeModel;
  attributes: object;
  modelClass: Constructable;
  mapper: IMapper;
}

type SequelizeModel =
  | CompanyNotificationSequelizeModel
  | ApplicantNotificationSequelizeModel
  | AdminNotificationSequelizeModel;

interface IMapper {
  toPersistenceModel: (notification: Notification) => SequelizeModel;
  toDomainModel: (sequelizeModel: SequelizeModel) => Notification;
}
