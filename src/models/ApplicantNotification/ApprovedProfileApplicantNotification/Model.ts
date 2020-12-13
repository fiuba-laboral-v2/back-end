import { ApplicantNotification, IApplicantNotificationAttributes } from "../ApplicantNotification";

export class ApprovedProfileApplicantNotification extends ApplicantNotification {
  constructor(attributes: IApprovedProfileAttributes) {
    super(attributes);
  }
}

export type IApprovedProfileAttributes = IApplicantNotificationAttributes;
