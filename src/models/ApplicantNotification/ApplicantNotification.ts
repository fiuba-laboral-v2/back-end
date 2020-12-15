import { UUID } from "$models/UUID";
import { AttributeNotDefinedError, InvalidAttributeFormatError } from "$models/Errors";
import { isNil } from "lodash";
import { Notification, INotificationAttributes } from "$models/Notification/Model";

export abstract class ApplicantNotification extends Notification {
  public notifiedApplicantUuid: string;
  public moderatorUuid: string;

  protected constructor(attributes: IApplicantNotificationAttributes) {
    super(attributes);
    this.setNotifiedApplicantUuid(attributes.notifiedApplicantUuid);
    this.setModeratorUuid(attributes.moderatorUuid);
  }

  private setNotifiedApplicantUuid(notifiedApplicantUuid: string) {
    const attributeName = "notifiedApplicantUuid";
    if (isNil(notifiedApplicantUuid)) throw new AttributeNotDefinedError(attributeName);
    if (!UUID.validate(notifiedApplicantUuid)) throw new InvalidAttributeFormatError(attributeName);
    this.notifiedApplicantUuid = notifiedApplicantUuid;
  }

  private setModeratorUuid(moderatorUuid: string) {
    const attributeName = "moderatorUuid";
    if (isNil(moderatorUuid)) throw new AttributeNotDefinedError(attributeName);
    if (!UUID.validate(moderatorUuid)) throw new InvalidAttributeFormatError(attributeName);
    this.moderatorUuid = moderatorUuid;
  }
}

export interface IApplicantNotificationAttributes extends INotificationAttributes {
  notifiedApplicantUuid: string;
  moderatorUuid: string;
}
