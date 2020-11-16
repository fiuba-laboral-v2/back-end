import { CompanyNewJobApplicationNotification } from "$models/CompanyNotification";

export enum CompanyNotificationType {
  newJobApplication = "newJobApplication"
}

export type TCompanyNotification = CompanyNewJobApplicationNotification;

export const companyNotificationTypeEnumValues = Object.keys(CompanyNotificationType);
