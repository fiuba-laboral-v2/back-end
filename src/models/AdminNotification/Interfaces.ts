import { IPaginatedInput } from "$graphql/Pagination/Types/GraphQLPaginatedInput";
import { Secretary } from "$models/Admin";

export enum AdminNotificationType {
  updatedCompanyProfile = "updatedCompanyProfile"
}

export const adminNotificationTypeEnumValues = Object.keys(AdminNotificationType);

export interface IFindLatestBySecretary {
  secretary: Secretary;
  updatedBeforeThan?: IPaginatedInput;
}
