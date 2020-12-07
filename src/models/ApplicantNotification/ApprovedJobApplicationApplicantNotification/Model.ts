import { UUID } from "$models/UUID";
import { AttributeNotDefinedError, InvalidAttributeFormatError } from "$models/Errors";
import { ApplicantNotification, IApplicantNotificationAttributes } from "../ApplicantNotification";
import { isNil } from "lodash";

export class ApprovedJobApplicationApplicantNotification extends ApplicantNotification {
  public jobApplicationUuid: string;

  constructor(attributes: IAttributes) {
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

interface IAttributes extends IApplicantNotificationAttributes {
  jobApplicationUuid: string;
}
