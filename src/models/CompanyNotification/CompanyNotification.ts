import { UUID } from "$models/UUID";
import { AttributeNotDefinedError, InvalidAttributeFormatError } from "$models/Errors";
import { isNil } from "lodash";
import { Notification, INotificationAttributes } from "$models/Notification/Model";

export abstract class CompanyNotification extends Notification {
  public notifiedCompanyUuid: string;

  protected constructor(attributes: IAttributes) {
    super(attributes);
    this.setNotifiedCompanyUuid(attributes.notifiedCompanyUuid);
  }

  private setNotifiedCompanyUuid(notifiedCompanyUuid: string) {
    const attributeName = "notifiedCompanyUuid";
    if (isNil(notifiedCompanyUuid)) throw new AttributeNotDefinedError(attributeName);
    if (!UUID.validate(notifiedCompanyUuid)) throw new InvalidAttributeFormatError(attributeName);
    this.notifiedCompanyUuid = notifiedCompanyUuid;
  }
}

export interface IAttributes extends INotificationAttributes {
  notifiedCompanyUuid: string;
}
