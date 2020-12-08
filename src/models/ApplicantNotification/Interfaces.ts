import { IPaginatedInput } from "$graphql/Pagination/Types/GraphQLPaginatedInput";

export enum ApplicantNotificationType {
  approvedJobApplication = "approvedJobApplication"
}

export const applicantNotificationTypeEnumValues = Object.keys(ApplicantNotificationType);

export interface IFindLatestByApplicant {
  applicantUuid: string;
  updatedBeforeThan?: IPaginatedInput;
}
