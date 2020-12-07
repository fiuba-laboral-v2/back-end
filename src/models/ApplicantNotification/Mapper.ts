import {
  ApprovedJobApplicationApplicantNotification,
  IApprovedJobApplicationAttributes,
  ApplicantNotification,
  ApplicantNotificationType as Type
} from "$models/ApplicantNotification";
import { ApplicantNotificationSequelizeModel } from "$models";

export const ApplicantNotificationMapper = {
  toPersistenceModel: (notification: ApplicantNotification) => {
    const type = {
      [ApprovedJobApplicationApplicantNotification.name]: Type.approvedJobApplication
    }[notification.constructor.name];
    if (!type) throw new Error("Could not map to a persistence model");

    return new ApplicantNotificationSequelizeModel({ ...notification, type });
  },
  toDomainModel: (sequelizeModel: ApplicantNotificationSequelizeModel): ApplicantNotification => {
    const attributes = sequelizeModel.toJSON();
    switch (sequelizeModel.type) {
      case Type.approvedJobApplication:
        return new ApprovedJobApplicationApplicantNotification(
          attributes as IApprovedJobApplicationAttributes
        );
    }
  }
};
