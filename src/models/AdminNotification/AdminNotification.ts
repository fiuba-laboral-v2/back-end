import { AttributeNotDefinedError, InvalidAttributeFormatError } from "$models/Errors";
import { isNil } from "lodash";
import { Notification, INotificationAttributes } from "$models/Notification/Model";
import { Secretary, SecretaryEnumValues } from "$models/Admin";

export abstract class AdminNotification extends Notification {
  public secretary: Secretary;

  protected constructor(attributes: IAdminNotificationAttributes) {
    super(attributes);
    this.setSecretary(attributes.secretary);
  }

  private setSecretary(secretary: Secretary) {
    const attributeName = "secretary";
    if (isNil(secretary)) throw new AttributeNotDefinedError(attributeName);
    if (!SecretaryEnumValues.includes(secretary)) {
      throw new InvalidAttributeFormatError(attributeName);
    }
    this.secretary = secretary;
  }
}

export interface IAdminNotificationAttributes extends INotificationAttributes {
  secretary: Secretary;
}
