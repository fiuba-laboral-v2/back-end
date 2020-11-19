import { CompanyNewJobApplicationNotification } from "$models/CompanyNotification";
import { IPaginatedInput } from "$graphql/Pagination/Types/GraphQLPaginatedInput";

export enum CompanyNotificationType {
  newJobApplication = "newJobApplication"
}

export type TCompanyNotification = CompanyNewJobApplicationNotification;

export const companyNotificationTypeEnumValues = Object.keys(CompanyNotificationType);

export interface IFindAll {
  companyUuid: string;
  updatedBeforeThan?: IPaginatedInput;
}
