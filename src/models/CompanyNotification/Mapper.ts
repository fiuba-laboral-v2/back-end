import {
  CompanyNewJobApplicationNotification,
  ICompanyNewJobApplicationNotificationAttributes,
  TCompanyNotification,
  CompanyNotificationType
} from "$models/CompanyNotification";
import { CompanyNotification } from "$models";

const typeMapper = {
  [CompanyNewJobApplicationNotification.name]: CompanyNotificationType.newJobApplication
};

export const CompanyNotificationMapper = {
  toPersistenceModel: (notification: TCompanyNotification) => {
    const type = typeMapper[notification.constructor.name];
    return new CompanyNotification({ ...notification, type });
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
