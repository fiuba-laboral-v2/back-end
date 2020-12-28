import {
  ApprovedJobApplicationApplicantNotification,
  IApprovedJobApplicationAttributes,
  RejectedJobApplicationApplicantNotification,
  IRejectedJobApplicationAttributes,
  ApprovedProfileApplicantNotification,
  IApprovedProfileAttributes,
  RejectedProfileApplicantNotification,
  IRejectedProfileAttributes,
  PendingJobApplicationApplicantNotification,
  IPendingJobApplicationAttributes,
  ApplicantNotification,
  ApplicantNotificationType as Type
} from "$models/ApplicantNotification";
import { UnknownNotificationError } from "$models/Notification/Errors";
import { ApplicantNotificationSequelizeModel } from "$models";

export const ApplicantNotificationMapper = {
  toPersistenceModel: (notification: ApplicantNotification) => {
    const notificationClassName = notification.constructor.name;
    const type = {
      [ApprovedJobApplicationApplicantNotification.name]: Type.approvedJobApplication,
      [RejectedJobApplicationApplicantNotification.name]: Type.rejectedJobApplication,
      [PendingJobApplicationApplicantNotification.name]: Type.pendingJobApplication,
      [ApprovedProfileApplicantNotification.name]: Type.approvedProfile,
      [RejectedProfileApplicantNotification.name]: Type.rejectedProfile
    }[notificationClassName];
    if (!type) throw new UnknownNotificationError(notificationClassName);

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
      case Type.pendingJobApplication:
        return new PendingJobApplicationApplicantNotification(
          attributes as IPendingJobApplicationAttributes
        );
      case Type.approvedProfile:
        return new ApprovedProfileApplicantNotification(attributes as IApprovedProfileAttributes);
      case Type.rejectedProfile:
        return new RejectedProfileApplicantNotification(attributes as IRejectedProfileAttributes);
    }
  }
};
