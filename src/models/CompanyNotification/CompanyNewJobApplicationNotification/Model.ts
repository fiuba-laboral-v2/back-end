import { AttributeNotDefinedError, InvalidAttributeFormatError } from "$models/Errors";
import { validate } from "uuid";
import { isNil } from "lodash";

export class CompanyNewJobApplicationNotification {
  public uuid?: string;
  public moderatorUuid: string;
  public notifiedCompanyUuid: string;
  public jobApplicationUuid: string;
  public isNew: boolean;
  public createdAt?: Date;

  constructor(attributes: ICompanyNewJobApplicationNotificationAttributes) {
    this.uuid = attributes.uuid;
    this.moderatorUuid = attributes.moderatorUuid;
    this.notifiedCompanyUuid = attributes.notifiedCompanyUuid;
    this.jobApplicationUuid = attributes.jobApplicationUuid;
    this.createdAt = attributes.createdAt;
    this.setIsNew(attributes.isNew);
    this.validate();
  }

  private setIsNew(isNew: boolean = true) {
    this.isNew = isNew;
  }

  private validate() {
    this.validatePresence();
    this.validateUuids();
  }

  private validatePresence() {
    if (isNil(this.moderatorUuid)) throw new AttributeNotDefinedError("moderatorUuid");
    if (isNil(this.notifiedCompanyUuid)) throw new AttributeNotDefinedError("notifiedCompanyUuid");
    if (isNil(this.jobApplicationUuid)) throw new AttributeNotDefinedError("jobApplicationUuid");
  }

  private validateUuids() {
    if (this.uuid && !validate(this.uuid)) throw new InvalidAttributeFormatError("uuid");
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
  isNew?: boolean;
  createdAt?: Date;
}
