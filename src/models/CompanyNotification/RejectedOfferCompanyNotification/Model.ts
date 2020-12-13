import { UUID } from "$models/UUID";
import { AttributeNotDefinedError, InvalidAttributeFormatError } from "$models/Errors";
import { CompanyNotification, IAttributes } from "../CompanyNotification";
import { isNil } from "lodash";

export class RejectedOfferCompanyNotification extends CompanyNotification {
  public offerUuid: string;
  public moderatorMessage: string;

  constructor(attributes: IRejectedOfferNotificationAttributes) {
    super(attributes);
    this.setOfferUuid(attributes.offerUuid);
    this.setModeratorMessage(attributes.moderatorMessage);
  }

  private setOfferUuid(offerUuid: string) {
    const attributeName = "offerUuid";
    if (isNil(offerUuid)) throw new AttributeNotDefinedError(attributeName);
    if (!UUID.validate(offerUuid)) throw new InvalidAttributeFormatError(attributeName);
    this.offerUuid = offerUuid;
  }

  private setModeratorMessage(moderatorMessage: string) {
    const attributeName = "moderatorMessage";
    if (isNil(moderatorMessage)) throw new AttributeNotDefinedError(attributeName);
    this.moderatorMessage = moderatorMessage;
  }
}

export interface IRejectedOfferNotificationAttributes extends IAttributes {
  offerUuid: string;
  moderatorMessage: string;
}
