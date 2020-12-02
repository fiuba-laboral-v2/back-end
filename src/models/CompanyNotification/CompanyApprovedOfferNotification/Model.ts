import { UUID } from "$models/UUID";
import { AttributeNotDefinedError, InvalidAttributeFormatError } from "$models/Errors";
import { CompanyNotification, IAttributes } from "../Notification";
import { isNil } from "lodash";

export class CompanyApprovedOfferNotification extends CompanyNotification {
  public offerUuid: string;

  constructor(attributes: IApprovedOfferNotificationAttributes) {
    super(attributes);
    this.setOfferUuid(attributes.offerUuid);
  }

  private setOfferUuid(offerUuid: string) {
    const attributeName = "offerUuid";
    if (isNil(offerUuid)) throw new AttributeNotDefinedError(attributeName);
    if (!UUID.validate(offerUuid)) throw new InvalidAttributeFormatError(attributeName);
    this.offerUuid = offerUuid;
  }
}

interface IApprovedOfferNotificationAttributes extends IAttributes {
  offerUuid: string;
}
