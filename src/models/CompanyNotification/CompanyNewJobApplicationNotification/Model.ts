import { isDefined, isUUID } from "class-validator";
import { AttributeNotDefinedError, InvalidAttributeFormatError } from "$models/Errors";
import { UuidGenerator } from "$models/UuidGenerator";

export class CompanyNewJobApplicationNotification {
  public uuid: string;
  public moderatorUuid: string;
  public notifiedCompanyUuid: string;
  public jobApplicationUuid: string;
  public isNew: boolean;
  public createdAt: Date;

  constructor(attributes: ICompanyNewJobApplicationNotificationAttributes) {
    this.uuid = attributes.uuid || UuidGenerator.generate();
    this.moderatorUuid = attributes.moderatorUuid;
    this.notifiedCompanyUuid = attributes.notifiedCompanyUuid;
    this.jobApplicationUuid = attributes.jobApplicationUuid;
    this.isNew = attributes.isNew;
    this.createdAt = attributes.createdAt;
    this.validate();
  }

  private validate() {
    this.validatePresence();
    this.validateUuids();
  }

  private validatePresence() {
    if (!isDefined(this.uuid)) throw new AttributeNotDefinedError("uuid");
    if (!isDefined(this.moderatorUuid)) throw new AttributeNotDefinedError("moderatorUuid");
    if (!isDefined(this.notifiedCompanyUuid)) {
      throw new AttributeNotDefinedError("notifiedCompanyUuid");
    }
    if (!isDefined(this.jobApplicationUuid)) {
      throw new AttributeNotDefinedError("jobApplicationUuid");
    }
    if (!isDefined(this.isNew)) throw new AttributeNotDefinedError("isNew");
    if (!isDefined(this.createdAt)) throw new AttributeNotDefinedError("createdAt");
  }

  private validateUuids() {
    if (!isUUID(this.uuid)) throw new InvalidAttributeFormatError("uuid");
    if (!isUUID(this.moderatorUuid)) throw new InvalidAttributeFormatError("moderatorUuid");
    if (!isUUID(this.notifiedCompanyUuid)) {
      throw new InvalidAttributeFormatError("notifiedCompanyUuid");
    }
    if (!isUUID(this.jobApplicationUuid)) {
      throw new InvalidAttributeFormatError("jobApplicationUuid");
    }
  }
}

export interface ICompanyNewJobApplicationNotificationAttributes {
  uuid?: string;
  moderatorUuid: string;
  notifiedCompanyUuid: string;
  jobApplicationUuid: string;
  isNew: boolean;
  createdAt: Date;
}
