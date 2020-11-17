import {
  CompanyNewJobApplicationNotification,
  ICompanyNewJobApplicationNotificationAttributes,
  TCompanyNotification,
  CompanyNotificationType
} from "$models/CompanyNotification";
import { CompanyNotification } from "$models";

export const CompanyNotificationMapper = {
  toPersistenceModel: (notification: TCompanyNotification) => {
    switch (notification.constructor) {
      case CompanyNewJobApplicationNotification:
        const type = CompanyNotificationType.newJobApplication;
        return new CompanyNotification({ ...notification, type });
    }
    throw new Error("Could no map to a persistence model");
  },
  toDomainModel: (companyNotification: CompanyNotification) => {
    const attributes = companyNotification.toJSON();
    let notification: TCompanyNotification;
    switch (companyNotification.type) {
      case CompanyNotificationType.newJobApplication:
        notification = new CompanyNewJobApplicationNotification(
          attributes as ICompanyNewJobApplicationNotificationAttributes
        );
    }
    notification.setUuid(companyNotification.uuid);
    notification.setCreatedAt(companyNotification.createdAt);
    return notification;
  }
};
