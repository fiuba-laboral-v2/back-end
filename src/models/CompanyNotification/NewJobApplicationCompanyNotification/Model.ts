import { AttributeNotDefinedError, InvalidAttributeFormatError } from "$models/Errors";
import { CompanyNotification, IAttributes } from "../CompanyNotification";
import { UUID } from "$models/UUID";
import { isNil } from "lodash";

export class NewJobApplicationCompanyNotification extends CompanyNotification {
  public jobApplicationUuid: string;

  constructor(attributes: INewJobApplicationNotificationAttributes) {
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

export interface INewJobApplicationNotificationAttributes extends IAttributes {
  jobApplicationUuid: string;
}
