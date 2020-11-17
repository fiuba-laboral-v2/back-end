import { AttributeNotDefinedError, InvalidAttributeFormatError } from "$models/Errors";
import { UuidGenerator } from "$models/UuidGenerator";
import { validate } from "uuid";
import { isNil } from "lodash";

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
    if (isNil(this.uuid)) throw new AttributeNotDefinedError("uuid");
    if (isNil(this.moderatorUuid)) throw new AttributeNotDefinedError("moderatorUuid");
    if (isNil(this.notifiedCompanyUuid)) throw new AttributeNotDefinedError("notifiedCompanyUuid");
    if (isNil(this.jobApplicationUuid)) throw new AttributeNotDefinedError("jobApplicationUuid");
    if (isNil(this.isNew)) throw new AttributeNotDefinedError("isNew");
    if (isNil(this.createdAt)) throw new AttributeNotDefinedError("createdAt");
  }

  private validateUuids() {
    if (!validate(this.uuid)) throw new InvalidAttributeFormatError("uuid");
    if (!validate(this.moderatorUuid)) throw new InvalidAttributeFormatError("moderatorUuid");
    if (!validate(this.notifiedCompanyUuid)) {
      throw new InvalidAttributeFormatError("notifiedCompanyUuid");
    }
    if (!validate(this.jobApplicationUuid)) {
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
