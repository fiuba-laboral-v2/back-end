import { UUID } from "$models/UUID";
import { AttributeNotDefinedError, InvalidAttributeFormatError } from "$models/Errors";
import { isNil } from "lodash";
import { Notification, INotificationAttributes } from "$models/Notification/Model";

export abstract class ApplicantNotification extends Notification {
  public notifiedApplicantUuid: string;

  protected constructor(attributes: IApplicantNotificationAttributes) {
    super(attributes);
    this.setNotifiedApplicantUuid(attributes.notifiedApplicantUuid);
  }

  private setNotifiedApplicantUuid(notifiedApplicantUuid: string) {
    const attributeName = "notifiedApplicantUuid";
    if (isNil(notifiedApplicantUuid)) throw new AttributeNotDefinedError(attributeName);
    if (!UUID.validate(notifiedApplicantUuid)) throw new InvalidAttributeFormatError(attributeName);
    this.notifiedApplicantUuid = notifiedApplicantUuid;
  }
}

export interface IApplicantNotificationAttributes extends INotificationAttributes {
  notifiedApplicantUuid: string;
}
