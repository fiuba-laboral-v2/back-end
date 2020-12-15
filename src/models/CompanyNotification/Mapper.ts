import {
  NewJobApplicationCompanyNotification,
  INewJobApplicationNotificationAttributes,
  ApprovedOfferCompanyNotification,
  IApprovedOfferNotificationAttributes,
  RejectedOfferCompanyNotification,
  IRejectedOfferNotificationAttributes,
  ApprovedProfileCompanyNotification,
  IApprovedProfileNotificationAttributes,
  RejectedProfileCompanyNotification,
  IRejectedProfileNotificationAttributes,
  CompanyNotification,
  CompanyNotificationType
} from "$models/CompanyNotification";
import { UnknownNotificationError } from "$models/Notification/Errors";
import { CompanyNotificationSequelizeModel } from "$models";

export const CompanyNotificationMapper = {
  toPersistenceModel: (notification: CompanyNotification) => {
    const notificationClassName = notification.constructor.name;
    const type = {
      [NewJobApplicationCompanyNotification.name]: CompanyNotificationType.newJobApplication,
      [ApprovedOfferCompanyNotification.name]: CompanyNotificationType.approvedOffer,
      [RejectedOfferCompanyNotification.name]: CompanyNotificationType.rejectedOffer,
      [ApprovedProfileCompanyNotification.name]: CompanyNotificationType.approvedProfile,
      [RejectedProfileCompanyNotification.name]: CompanyNotificationType.rejectedProfile
    }[notificationClassName];
    if (!type) throw new UnknownNotificationError(notificationClassName);

    return new CompanyNotificationSequelizeModel({ ...notification, type });
  },
  toDomainModel: (companyNotification: CompanyNotificationSequelizeModel): CompanyNotification => {
    const attributes = companyNotification.toJSON();
    switch (companyNotification.type) {
      case CompanyNotificationType.newJobApplication:
        return new NewJobApplicationCompanyNotification(
          attributes as INewJobApplicationNotificationAttributes
        );
      case CompanyNotificationType.approvedOffer:
        return new ApprovedOfferCompanyNotification(
          attributes as IApprovedOfferNotificationAttributes
        );
      case CompanyNotificationType.rejectedOffer:
        return new RejectedOfferCompanyNotification(
          attributes as IRejectedOfferNotificationAttributes
        );
      case CompanyNotificationType.approvedProfile:
        return new ApprovedProfileCompanyNotification(
          attributes as IApprovedProfileNotificationAttributes
        );
      case CompanyNotificationType.rejectedProfile:
        return new RejectedProfileCompanyNotification(
          attributes as IRejectedProfileNotificationAttributes
        );
    }
  }
};
