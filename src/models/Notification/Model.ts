import { UUID } from "$models/UUID";
import { AttributeNotDefinedError, InvalidAttributeFormatError } from "$models/Errors";
import { isNil } from "lodash";

export abstract class Notification {
  public uuid?: string;
  public moderatorUuid: string;
  public isNew: boolean;
  public createdAt?: Date;

  protected constructor(attributes: INotificationAttributes) {
    this.setModeratorUuid(attributes.moderatorUuid);
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
}

export interface INotificationAttributes {
  uuid?: string;
  moderatorUuid: string;
  isNew?: boolean;
  createdAt?: Date;
}
