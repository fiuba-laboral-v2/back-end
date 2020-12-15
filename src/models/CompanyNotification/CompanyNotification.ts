import { UUID } from "$models/UUID";
import { AttributeNotDefinedError, InvalidAttributeFormatError } from "$models/Errors";
import { isNil } from "lodash";
import { Notification, INotificationAttributes } from "$models/Notification/Model";

export abstract class CompanyNotification extends Notification {
  public notifiedCompanyUuid: string;
  public moderatorUuid: string;

  protected constructor(attributes: IAttributes) {
    super(attributes);
    this.setNotifiedCompanyUuid(attributes.notifiedCompanyUuid);
    this.setModeratorUuid(attributes.moderatorUuid);
  }

  private setNotifiedCompanyUuid(notifiedCompanyUuid: string) {
    const attributeName = "notifiedCompanyUuid";
    if (isNil(notifiedCompanyUuid)) throw new AttributeNotDefinedError(attributeName);
    if (!UUID.validate(notifiedCompanyUuid)) throw new InvalidAttributeFormatError(attributeName);
    this.notifiedCompanyUuid = notifiedCompanyUuid;
  }

  private setModeratorUuid(moderatorUuid: string) {
    const attributeName = "moderatorUuid";
    if (isNil(moderatorUuid)) throw new AttributeNotDefinedError(attributeName);
    if (!UUID.validate(moderatorUuid)) throw new InvalidAttributeFormatError(attributeName);
    this.moderatorUuid = moderatorUuid;
  }
}

export interface IAttributes extends INotificationAttributes {
  notifiedCompanyUuid: string;
  moderatorUuid: string;
}
