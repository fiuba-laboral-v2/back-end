import { isDefined, isUUID } from "class-validator";
import { AttributeNotDefinedError, InvalidAttributeFormatError } from "$models/Errors";
import { UuidGenerator } from "$models/UuidGenerator";

export class CompanyNewJobApplicationNotification {
  public uuid: string;
  public moderatorUuid: string;
  public companyUuid: string;
  public isNew: boolean;
  public createdAt: Date;

  constructor(attributes: IAttributes) {
    this.uuid = UuidGenerator.generate();
    this.moderatorUuid = attributes.moderatorUuid;
    this.companyUuid = attributes.companyUuid;
    this.isNew = attributes.isNew;
    this.createdAt = attributes.createdAt;
    this.validate();
  }

  private validate() {
    this.validatePresenceOf();
    this.validateFormat();
  }

  private validatePresenceOf() {
    if (!isDefined(this.uuid)) throw new AttributeNotDefinedError("uuid");
    if (!isDefined(this.moderatorUuid)) throw new AttributeNotDefinedError("moderatorUuid");
    if (!isDefined(this.companyUuid)) throw new AttributeNotDefinedError("companyUuid");
    if (!isDefined(this.isNew)) throw new AttributeNotDefinedError("isNew");
    if (!isDefined(this.createdAt)) throw new AttributeNotDefinedError("createdAt");
  }

  private validateFormat() {
    if (!isUUID(this.uuid)) throw new InvalidAttributeFormatError("uuid");
    if (!isUUID(this.moderatorUuid)) throw new InvalidAttributeFormatError("moderatorUuid");
    if (!isUUID(this.companyUuid)) throw new InvalidAttributeFormatError("companyUuid");
  }
}

interface IAttributes {
  moderatorUuid: string;
  companyUuid: string;
  isNew: boolean;
  createdAt: Date;
}
