import {
  NewJobApplicationCompanyNotification,
  INewJobApplicationNotificationAttributes,
  ApprovedOfferCompanyNotification,
  IApprovedOfferNotificationAttributes,
  RejectedOfferCompanyNotification,
  IRejectedOfferNotificationAttributes,
  CompanyNotification,
  CompanyNotificationType
} from "$models/CompanyNotification";
import { CompanyNotificationSequelizeModel } from "$models";

export const CompanyNotificationMapper = {
  toPersistenceModel: (notification: CompanyNotification) => {
    const type = {
      [NewJobApplicationCompanyNotification.name]: CompanyNotificationType.newJobApplication,
      [ApprovedOfferCompanyNotification.name]: CompanyNotificationType.approvedOffer,
      [RejectedOfferCompanyNotification.name]: CompanyNotificationType.rejectedOffer
    }[notification.constructor.name];
    if (!type) throw new Error("Could not map to a persistence model");

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
    }
  }
};
