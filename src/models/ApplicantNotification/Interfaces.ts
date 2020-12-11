import { IPaginatedInput } from "$graphql/Pagination/Types/GraphQLPaginatedInput";

export enum ApplicantNotificationType {
  approvedJobApplication = "approvedJobApplication",
  rejectedJobApplication = "rejectedJobApplication"
}

export const applicantNotificationTypeEnumValues = Object.keys(ApplicantNotificationType);

export interface IFindLatestByApplicant {
  applicantUuid: string;
  updatedBeforeThan?: IPaginatedInput;
}

export interface IHasUnreadNotifications {
  applicantUuid: string;
}
