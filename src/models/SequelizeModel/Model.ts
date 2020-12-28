import { BeforeCreate, Column, Model } from "sequelize-typescript";
import { BuildOptions, UUID } from "sequelize";
import { Nullable } from "./Types";
import { isUuid } from "$models/SequelizeModelValidators";
import { UUID as UUIDModule } from "$models/UUID";

export class SequelizeModel<T, Attributes extends IBase = object> extends Model<T> {
  @BeforeCreate
  public static beforeCreateHook<T>(instance: SequelizeModel<T>) {
    instance.uuid = UUIDModule.generate();
  }

  @Column({ allowNull: true, primaryKey: true, type: UUID, ...isUuid })
  public uuid: Nullable<string>;

  constructor(attributes?: Attributes, options?: BuildOptions) {
    super(attributes, options);
    this.isNewRecord = !attributes?.uuid;
  }
}

interface IBase {
  uuid?: string;
}
