import { UUID } from "$models/UUID";
import { AttributeNotDefinedError, InvalidAttributeFormatError } from "$models/Errors";
import { CompanyNotification, IAttributes } from "../CompanyNotification";
import { isNil } from "lodash";
import { Secretary, SecretaryEnumValues } from "$models/Admin";

export class RejectedOfferCompanyNotification extends CompanyNotification {
  public offerUuid: string;
  public moderatorMessage: string;
  public secretary: Secretary;

  constructor(attributes: IRejectedOfferNotificationAttributes) {
    super(attributes);
    this.setOfferUuid(attributes.offerUuid);
    this.setModeratorMessage(attributes.moderatorMessage);
    this.setSecretary(attributes.secretary);
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

  private setSecretary(secretary: Secretary) {
    const attributeName = "secretary";
    if (isNil(secretary)) throw new AttributeNotDefinedError(attributeName);
    const isValid = SecretaryEnumValues.includes(secretary);
    if (!isValid) throw new InvalidAttributeFormatError(attributeName);
    this.secretary = secretary;
  }
}

export interface IRejectedOfferNotificationAttributes extends IAttributes {
  offerUuid: string;
  moderatorMessage: string;
  secretary: Secretary;
}
