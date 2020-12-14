import {
  ApprovedJobApplicationApplicantNotification,
  IApprovedJobApplicationAttributes,
  RejectedJobApplicationApplicantNotification,
  IRejectedJobApplicationAttributes,
  ApprovedProfileApplicantNotification,
  IApprovedProfileAttributes,
  RejectedProfileApplicantNotification,
  IRejectedProfileAttributes,
  ApplicantNotification,
  ApplicantNotificationType as Type
} from "$models/ApplicantNotification";
import { ApplicantNotificationSequelizeModel } from "$models";

export const ApplicantNotificationMapper = {
  toPersistenceModel: (notification: ApplicantNotification) => {
    const type = {
      [ApprovedJobApplicationApplicantNotification.name]: Type.approvedJobApplication,
      [RejectedJobApplicationApplicantNotification.name]: Type.rejectedJobApplication,
      [ApprovedProfileApplicantNotification.name]: Type.approvedProfile,
      [RejectedProfileApplicantNotification.name]: Type.rejectedProfile
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
      case Type.rejectedJobApplication:
        return new RejectedJobApplicationApplicantNotification(
          attributes as IRejectedJobApplicationAttributes
        );
      case Type.approvedProfile:
        return new ApprovedProfileApplicantNotification(attributes as IApprovedProfileAttributes);
      case Type.rejectedProfile:
        return new RejectedProfileApplicantNotification(attributes as IRejectedProfileAttributes);
    }
  }
};
