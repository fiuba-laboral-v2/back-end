import { UUID } from "$models/UUID";
import { AttributeNotDefinedError, InvalidAttributeFormatError } from "$models/Errors";
import { isNil } from "lodash";

export abstract class CompanyNotification {
  public uuid?: string;
  public moderatorUuid: string;
  public notifiedCompanyUuid: string;
  public isNew: boolean;
  public createdAt?: Date;

  protected constructor(attributes: IAttributes) {
    this.setModeratorUuid(attributes.moderatorUuid);
    this.setNotifiedCompanyUuid(attributes.notifiedCompanyUuid);
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
    const attributeName = "moderatorUuid";
    if (isNil(moderatorUuid)) throw new AttributeNotDefinedError(attributeName);
    if (!UUID.validate(moderatorUuid)) throw new InvalidAttributeFormatError(attributeName);
    this.moderatorUuid = moderatorUuid;
  }

  private setNotifiedCompanyUuid(notifiedCompanyUuid: string) {
    const attributeName = "notifiedCompanyUuid";
    if (isNil(notifiedCompanyUuid)) throw new AttributeNotDefinedError(attributeName);
    if (!UUID.validate(notifiedCompanyUuid)) throw new InvalidAttributeFormatError(attributeName);
    this.notifiedCompanyUuid = notifiedCompanyUuid;
  }
}

export interface IAttributes {
  uuid?: string;
  moderatorUuid: string;
  notifiedCompanyUuid: string;
  isNew?: boolean;
  createdAt?: Date;
}
