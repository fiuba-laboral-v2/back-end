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
    this.setModeratorUuid(attributes.moderatorUuid);
    this.setNotifiedCompanyUuid(attributes.notifiedCompanyUuid);
    this.setJobApplicationUuid(attributes.jobApplicationUuid);
    this.setIsNew(attributes.isNew);
    this.setUuid(attributes.uuid);
    this.setCreatedAt(attributes.createdAt);
  }

  public setUuid(uuid?: string) {
    if (uuid && !validate(uuid)) throw new InvalidAttributeFormatError("uuid");
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
    if (!validate(moderatorUuid)) throw new InvalidAttributeFormatError("moderatorUuid");
    this.moderatorUuid = moderatorUuid;
  }

  private setNotifiedCompanyUuid(notifiedCompanyUuid: string) {
    const attributeName = "notifiedCompanyUuid";
    if (isNil(notifiedCompanyUuid)) throw new AttributeNotDefinedError(attributeName);
    if (!validate(notifiedCompanyUuid)) throw new InvalidAttributeFormatError(attributeName);
    this.notifiedCompanyUuid = notifiedCompanyUuid;
  }

  private setJobApplicationUuid(jobApplicationUuid: string) {
    if (isNil(jobApplicationUuid)) throw new AttributeNotDefinedError("jobApplicationUuid");
    if (!validate(jobApplicationUuid)) throw new InvalidAttributeFormatError("jobApplicationUuid");
    this.jobApplicationUuid = jobApplicationUuid;
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
