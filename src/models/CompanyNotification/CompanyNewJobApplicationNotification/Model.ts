import { AttributeNotDefinedError, InvalidAttributeFormatError } from "$models/Errors";
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
    this.moderatorUuid = attributes.moderatorUuid;
    this.notifiedCompanyUuid = attributes.notifiedCompanyUuid;
    this.jobApplicationUuid = attributes.jobApplicationUuid;
    this.isNew = attributes.isNew;
    this.validate();
  }

  public setUuid(uuid: string) {
    if (isNil(uuid)) throw new AttributeNotDefinedError("uuid");
    if (!validate(uuid)) throw new InvalidAttributeFormatError("uuid");
    this.uuid = uuid;
  }

  public setCreatedAt(createdAt: Date) {
    if (isNil(createdAt)) throw new AttributeNotDefinedError("createdAt");
    this.createdAt = createdAt;
  }

  private validate() {
    this.validatePresence();
    this.validateUuids();
  }

  private validatePresence() {
    if (isNil(this.moderatorUuid)) throw new AttributeNotDefinedError("moderatorUuid");
    if (isNil(this.notifiedCompanyUuid)) throw new AttributeNotDefinedError("notifiedCompanyUuid");
    if (isNil(this.jobApplicationUuid)) throw new AttributeNotDefinedError("jobApplicationUuid");
    if (isNil(this.isNew)) throw new AttributeNotDefinedError("isNew");
  }

  private validateUuids() {
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
  moderatorUuid: string;
  notifiedCompanyUuid: string;
  jobApplicationUuid: string;
  isNew: boolean;
}
