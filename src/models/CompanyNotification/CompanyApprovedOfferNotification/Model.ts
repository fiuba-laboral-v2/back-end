import { UUID } from "$models/UUID";
import { AttributeNotDefinedError, InvalidAttributeFormatError } from "$models/Errors";
import { isNil } from "lodash";

export class CompanyApprovedOfferNotification {
  public uuid?: string;
  public moderatorUuid: string;
  public notifiedCompanyUuid: string;
  public offerUuid: string;
  public isNew: boolean;
  public createdAt?: Date;

  constructor(attributes: IApprovedOfferNotificationAttributes) {
    this.setModeratorUuid(attributes.moderatorUuid);
    this.setNotifiedCompanyUuid(attributes.notifiedCompanyUuid);
    this.setOfferUuid(attributes.offerUuid);
    this.setIsNew(attributes.isNew);
    this.setUuid(attributes.uuid);
    this.setCreatedAt(attributes.createdAt);
  }

  public setUuid(uuid?: string) {
    if (uuid && !UUID.validate(uuid)) throw new InvalidAttributeFormatError("uuid");
    this.uuid = uuid;
  }

  public setCreatedAt(createdAt?: Date) {
    this.createdAt = createdAt;
  }

  private setIsNew(isNew: boolean = true) {
    this.isNew = isNew;
  }

  private setModeratorUuid(moderatorUuid: string) {
    if (isNil(moderatorUuid)) throw new AttributeNotDefinedError("moderatorUuid");
    if (!UUID.validate(moderatorUuid)) throw new InvalidAttributeFormatError("moderatorUuid");
    this.moderatorUuid = moderatorUuid;
  }

  private setNotifiedCompanyUuid(notifiedCompanyUuid: string) {
    const attributeName = "notifiedCompanyUuid";
    if (isNil(notifiedCompanyUuid)) throw new AttributeNotDefinedError(attributeName);
    if (!UUID.validate(notifiedCompanyUuid)) throw new InvalidAttributeFormatError(attributeName);
    this.notifiedCompanyUuid = notifiedCompanyUuid;
  }

  private setOfferUuid(offerUuid: string) {
    const attributeName = "offerUuid";
    if (isNil(offerUuid)) throw new AttributeNotDefinedError(attributeName);
    if (!UUID.validate(offerUuid)) throw new InvalidAttributeFormatError(attributeName);
    this.offerUuid = offerUuid;
  }
}

interface IApprovedOfferNotificationAttributes {
  uuid?: string;
  moderatorUuid: string;
  notifiedCompanyUuid: string;
  offerUuid: string;
  isNew?: boolean;
  createdAt?: Date;
}
