import { Notification, INotificationAttributes } from "$models/Notification";
import { Secretary, SecretaryEnumValues } from "$models/Admin";
import { isNil } from "lodash";
import { AttributeNotDefinedError, InvalidAttributeFormatError } from "$models/Errors";
import { UUID } from "$models/UUID";

export class UpdatedCompanyProfileAdminNotification extends Notification {
  public secretary: Secretary;
  public companyUuid: string;

  constructor(attributes: IUpdatedCompanyProfileNotification) {
    super(attributes);
    this.setCompanyUuid(attributes.companyUuid);
    this.setSecretary(attributes.secretary);
  }

  private setCompanyUuid(companyUuid: string) {
    const attributeName = "companyUuid";
    if (isNil(companyUuid)) throw new AttributeNotDefinedError(attributeName);
    if (!UUID.validate(companyUuid)) throw new InvalidAttributeFormatError(attributeName);
    this.companyUuid = companyUuid;
  }

  private setSecretary(secretary: Secretary) {
    const attributeName = "secretary";
    if (isNil(secretary)) throw new AttributeNotDefinedError(attributeName);
    if (!SecretaryEnumValues.includes(secretary)) {
      throw new InvalidAttributeFormatError(attributeName);
    }
    this.secretary = secretary;
  }
}

export interface IUpdatedCompanyProfileNotification extends INotificationAttributes {
  secretary: Secretary;
  companyUuid: string;
}
