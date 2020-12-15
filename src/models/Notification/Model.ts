import { UUID } from "$models/UUID";
import { InvalidAttributeFormatError } from "$models/Errors";

export abstract class Notification {
  public uuid?: string;
  public isNew: boolean;
  public createdAt?: Date;

  protected constructor(attributes: INotificationAttributes) {
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
}

export interface INotificationAttributes {
  uuid?: string;
  isNew?: boolean;
  createdAt?: Date;
}
