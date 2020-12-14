import { ApplicantNotification, IApplicantNotificationAttributes } from "../ApplicantNotification";
import { AttributeNotDefinedError } from "$models/Errors";
import { isNil } from "lodash";

export class RejectedProfileApplicantNotification extends ApplicantNotification {
  public moderatorMessage: string;

  constructor(attributes: IRejectedProfileAttributes) {
    super(attributes);
    this.setModeratorMessage(attributes.moderatorMessage);
  }

  private setModeratorMessage(moderatorMessage: string) {
    const attributeName = "moderatorMessage";
    if (isNil(moderatorMessage)) throw new AttributeNotDefinedError(attributeName);
    this.moderatorMessage = moderatorMessage;
  }
}

export interface IRejectedProfileAttributes extends IApplicantNotificationAttributes {
  moderatorMessage: string;
}
