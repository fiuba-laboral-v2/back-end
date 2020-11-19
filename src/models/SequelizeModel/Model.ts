import { Column, Model } from "sequelize-typescript";
import { BuildOptions, UUID } from "sequelize";
import { isUuid } from "$models/SequelizeModelValidators";

export class SequelizeModel<T, Attributes extends IBase = object> extends Model<T> {
  @Column({ allowNull: true, primaryKey: true, type: UUID, ...isUuid })
  public uuid?: string;

  constructor(attributes?: Attributes, options?: BuildOptions) {
    super(attributes, options);
    if (attributes) this.isNewRecord = !attributes.uuid;
  }
}

interface IBase {
  uuid?: string;
}
