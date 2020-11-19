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
        const companyNotification = new CompanyNotification({ ...notification, type });
        companyNotification.isNewRecord = !notification.uuid;
        return companyNotification;
    }
    throw new Error("Could no map to a persistence model");
  },
  toDomainModel: (companyNotification: CompanyNotification) => {
    const attributes = companyNotification.toJSON();
    switch (companyNotification.type) {
      case CompanyNotificationType.newJobApplication:
        return new CompanyNewJobApplicationNotification(
          attributes as ICompanyNewJobApplicationNotificationAttributes
        );
    }
  }
};
