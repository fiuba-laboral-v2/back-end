import { CompanyNotification, IAttributes } from "../CompanyNotification";

export class ApprovedProfileCompanyNotification extends CompanyNotification {
  constructor(attributes: IApprovedProfileNotificationAttributes) {
    super(attributes);
  }
}

export type IApprovedProfileNotificationAttributes = IAttributes;
