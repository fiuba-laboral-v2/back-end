import { UUID } from "$models/UUID";
import { AttributeNotDefinedError, InvalidAttributeFormatError } from "$models/Errors";
import { ApplicantNotification, IApplicantNotificationAttributes } from "../ApplicantNotification";
import { isNil } from "lodash";

export class RejectedJobApplicationApplicantNotification extends ApplicantNotification {
  public jobApplicationUuid: string;
  public moderatorMessage: string;

  constructor(attributes: IRejectedJobApplicationAttributes) {
    super(attributes);
    this.setJobApplicationUuid(attributes.jobApplicationUuid);
    this.setModeratorMessage(attributes.moderatorMessage);
  }

  private setModeratorMessage(moderatorMessage: string) {
    const attributeName = "moderatorMessage";
    if (isNil(moderatorMessage)) throw new AttributeNotDefinedError(attributeName);
    this.moderatorMessage = moderatorMessage;
  }

  private setJobApplicationUuid(jobApplicationUuid: string) {
    const attributeName = "jobApplicationUuid";
    if (isNil(jobApplicationUuid)) throw new AttributeNotDefinedError(attributeName);
    if (!UUID.validate(jobApplicationUuid)) throw new InvalidAttributeFormatError(attributeName);
    this.jobApplicationUuid = jobApplicationUuid;
  }
}

export interface IRejectedJobApplicationAttributes extends IApplicantNotificationAttributes {
  jobApplicationUuid: string;
  moderatorMessage: string;
}
