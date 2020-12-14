import { CompanyNotification, IAttributes } from "../CompanyNotification";
import { isNil } from "lodash";
import { AttributeNotDefinedError } from "$models/Errors";

export class RejectedProfileCompanyNotification extends CompanyNotification {
  public moderatorMessage: string;

  constructor(attributes: IRejectedProfileNotificationAttributes) {
    super(attributes);
    this.setModeratorMessage(attributes.moderatorMessage);
  }

  private setModeratorMessage(moderatorMessage: string) {
    const attributeName = "moderatorMessage";
    if (isNil(moderatorMessage)) throw new AttributeNotDefinedError(attributeName);
    this.moderatorMessage = moderatorMessage;
  }
}

export interface IRejectedProfileNotificationAttributes extends IAttributes {
  moderatorMessage: string;
}
