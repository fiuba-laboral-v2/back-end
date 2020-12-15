import { AdminNotification, IAdminNotificationAttributes } from "..";
import { isNil } from "lodash";
import { AttributeNotDefinedError, InvalidAttributeFormatError } from "$models/Errors";
import { UUID } from "$models/UUID";

export class UpdatedCompanyProfileAdminNotification extends AdminNotification {
  public companyUuid: string;

  constructor(attributes: IUpdatedCompanyProfileNotification) {
    super(attributes);
    this.setCompanyUuid(attributes.companyUuid);
  }

  private setCompanyUuid(companyUuid: string) {
    const attributeName = "companyUuid";
    if (isNil(companyUuid)) throw new AttributeNotDefinedError(attributeName);
    if (!UUID.validate(companyUuid)) throw new InvalidAttributeFormatError(attributeName);
    this.companyUuid = companyUuid;
  }
}

export interface IUpdatedCompanyProfileNotification extends IAdminNotificationAttributes {
  companyUuid: string;
}
