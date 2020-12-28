import { UUID } from "$models/UUID";
import { AttributeNotDefinedError, InvalidAttributeFormatError } from "$models/Errors";
import { ApplicantNotification, IApplicantNotificationAttributes } from "../ApplicantNotification";
import { isNil } from "lodash";

export class PendingJobApplicationApplicantNotification extends ApplicantNotification {
  public jobApplicationUuid: string;

  constructor(attributes: IPendingJobApplicationAttributes) {
    super(attributes);
    this.setJobApplicationUuid(attributes.jobApplicationUuid);
  }

  private setJobApplicationUuid(jobApplicationUuid: string) {
    const attributeName = "jobApplicationUuid";
    if (isNil(jobApplicationUuid)) throw new AttributeNotDefinedError(attributeName);
    if (!UUID.validate(jobApplicationUuid)) throw new InvalidAttributeFormatError(attributeName);
    this.jobApplicationUuid = jobApplicationUuid;
  }
}

export interface IPendingJobApplicationAttributes extends IApplicantNotificationAttributes {
  jobApplicationUuid: string;
}
