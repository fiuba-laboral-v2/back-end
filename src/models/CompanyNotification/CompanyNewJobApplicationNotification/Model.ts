import { AttributeNotDefinedError, InvalidAttributeFormatError } from "$models/Errors";
import { UUID } from "$models/UUID";
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

  private setJobApplicationUuid(jobApplicationUuid: string) {
    const attributeName = "jobApplicationUuid";
    if (isNil(jobApplicationUuid)) throw new AttributeNotDefinedError(attributeName);
    if (!UUID.validate(jobApplicationUuid)) throw new InvalidAttributeFormatError(attributeName);
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
