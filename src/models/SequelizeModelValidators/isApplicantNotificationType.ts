import { applicantNotificationTypeEnumValues } from "$models/ApplicantNotification";

export const isApplicantNotificationType = {
  validate: {
    isIn: {
      msg: `ApplicantNotificationType must be one of these values: ${applicantNotificationTypeEnumValues}`,
      args: [applicantNotificationTypeEnumValues]
    }
  }
};
