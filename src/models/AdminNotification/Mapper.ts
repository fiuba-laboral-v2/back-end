import {
  UpdatedCompanyProfileAdminNotification,
  IUpdatedCompanyProfileNotification,
  AdminNotification,
  AdminNotificationType as Type
} from "$models/AdminNotification";
import { UnknownNotificationError } from "$models/Notification/Errors";
import { AdminNotificationSequelizeModel } from "$models";

export const AdminNotificationMapper = {
  toPersistenceModel: (notification: AdminNotification) => {
    const notificationClassName = notification.constructor.name;
    const type = {
      [UpdatedCompanyProfileAdminNotification.name]: Type.updatedCompanyProfile
    }[notificationClassName];
    if (!type) throw new UnknownNotificationError(notificationClassName);

    return new AdminNotificationSequelizeModel({ ...notification, type });
  },
  toDomainModel: (sequelizeModel: AdminNotificationSequelizeModel): AdminNotification => {
    const attributes = sequelizeModel.toJSON();
    switch (sequelizeModel.type) {
      case Type.updatedCompanyProfile:
        return new UpdatedCompanyProfileAdminNotification(
          attributes as IUpdatedCompanyProfileNotification
        );
    }
  }
};
