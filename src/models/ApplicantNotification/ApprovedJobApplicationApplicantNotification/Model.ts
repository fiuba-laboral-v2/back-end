import { UUID } from "$models/UUID";
import { AttributeNotDefinedError, InvalidAttributeFormatError } from "$models/Errors";
import { isNil } from "lodash";

export class ApprovedJobApplicationApplicantNotification {
  public uuid?: string;
  public moderatorUuid: string;
  public notifiedApplicantUuid: string;
  public jobApplicationUuid: string;
  public isNew: boolean;
  public createdAt?: Date;

  constructor(attributes: IAttributes) {
    this.setModeratorUuid(attributes.moderatorUuid);
    this.setNotifiedApplicantUuid(attributes.notifiedApplicantUuid);
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
    const attributeName = "moderatorUuid";
    if (isNil(moderatorUuid)) throw new AttributeNotDefinedError(attributeName);
    if (!UUID.validate(moderatorUuid)) throw new InvalidAttributeFormatError(attributeName);
    this.moderatorUuid = moderatorUuid;
  }

  private setNotifiedApplicantUuid(notifiedApplicantUuid: string) {
    const attributeName = "notifiedApplicantUuid";
    if (isNil(notifiedApplicantUuid)) throw new AttributeNotDefinedError(attributeName);
    if (!UUID.validate(notifiedApplicantUuid)) throw new InvalidAttributeFormatError(attributeName);
    this.notifiedApplicantUuid = notifiedApplicantUuid;
  }

  private setJobApplicationUuid(jobApplicationUuid: string) {
    const attributeName = "jobApplicationUuid";
    if (isNil(jobApplicationUuid)) throw new AttributeNotDefinedError(attributeName);
    if (!UUID.validate(jobApplicationUuid)) throw new InvalidAttributeFormatError(attributeName);
    this.jobApplicationUuid = jobApplicationUuid;
  }
}

interface IAttributes {
  uuid?: string;
  moderatorUuid: string;
  notifiedApplicantUuid: string;
  jobApplicationUuid: string;
  isNew?: boolean;
  createdAt?: Date;
}
