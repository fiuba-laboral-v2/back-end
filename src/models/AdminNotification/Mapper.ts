import {
  UpdatedCompanyProfileAdminNotification,
  IUpdatedCompanyProfileNotification,
  AdminNotification,
  AdminNotificationType as Type
} from "$models/AdminNotification";
import { AdminNotificationSequelizeModel } from "$models";

export const AdminNotificationMapper = {
  toPersistenceModel: (notification: AdminNotification) => {
    const type = {
      [UpdatedCompanyProfileAdminNotification.name]: Type.updatedCompanyProfile
    }[notification.constructor.name];
    if (!type) throw new Error("Could not map to a persistence model");

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
