import { UUID } from "$models/UUID";
import { Nullable } from "$models/SequelizeModel";
import { InvalidAttributeFormatError } from "$models/Errors";

export abstract class Notification {
  public uuid?: Nullable<string>;
  public isNew: boolean;
  public createdAt?: Date;

  protected constructor(attributes: INotificationAttributes) {
    this.setIsNew(attributes.isNew);
    this.setUuid(attributes.uuid);
    this.setCreatedAt(attributes.createdAt);
  }

  public setUuid(uuid: Nullable<string>) {
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
  uuid?: Nullable<string>;
  isNew?: boolean;
  createdAt?: Date;
}
