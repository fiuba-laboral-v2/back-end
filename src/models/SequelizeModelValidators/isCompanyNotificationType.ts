import { companyNotificationTypeEnumValues } from "$models/CompanyNotification";

export const isCompanyNotificationType = {
  validate: {
    isIn: {
      msg: `CompanyNotificationType must be one of these values: ${companyNotificationTypeEnumValues}`,
      args: [companyNotificationTypeEnumValues]
    }
  }
};
