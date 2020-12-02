import {
  CompanyNewJobApplicationNotification,
  ICompanyNewJobApplicationNotificationAttributes,
  CompanyApprovedOfferNotification,
  IApprovedOfferNotificationAttributes,
  TCompanyNotification,
  CompanyNotificationType
} from "$models/CompanyNotification";
import { CompanyNotification } from "$models";

export const CompanyNotificationMapper = {
  toPersistenceModel: (notification: TCompanyNotification) => {
    const type = {
      [CompanyNewJobApplicationNotification.name]: CompanyNotificationType.newJobApplication,
      [CompanyApprovedOfferNotification.name]: CompanyNotificationType.approvedOffer
    }[notification.constructor.name];
    if (!type) throw new Error("Could no map to a persistence model");

    return new CompanyNotification({ ...notification, type });
  },
  toDomainModel: (companyNotification: CompanyNotification) => {
    const attributes = companyNotification.toJSON();
    switch (companyNotification.type) {
      case CompanyNotificationType.newJobApplication:
        return new CompanyNewJobApplicationNotification(
          attributes as ICompanyNewJobApplicationNotificationAttributes
        );
      case CompanyNotificationType.approvedOffer:
        return new CompanyApprovedOfferNotification(
          attributes as IApprovedOfferNotificationAttributes
        );
    }
  }
};
