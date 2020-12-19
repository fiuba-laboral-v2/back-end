import {
  BelongsTo,
  Column,
  CreatedAt,
  ForeignKey,
  Model,
  Table,
  UpdatedAt
} from "sequelize-typescript";
import { ENUM, UUID } from "sequelize";
import { UserSequelizeModel } from "..";
import { Secretary, SecretaryEnumValues } from "./Interface";
import { isSecretary } from "../SequelizeModelValidators";

@Table({ tableName: "Admins", timestamps: true })
export class Admin extends Model<Admin> {
  @ForeignKey(() => UserSequelizeModel)
  @Column({ primaryKey: true, allowNull: false, type: UUID })
  public userUuid: string;

  @Column({
    allowNull: false,
    type: ENUM<string>({ values: SecretaryEnumValues }),
    ...isSecretary
  })
  public secretary: Secretary;

  @CreatedAt
  @Column
  public createdAt: Date;

  @UpdatedAt
  @Column
  public updatedAt: Date;

  @BelongsTo(() => UserSequelizeModel, "userUuid")
  public user: UserSequelizeModel;

  public isFromExtensionSecretary() {
    return this.secretary === Secretary.extension;
  }

  public isFromGraduadosSecretary() {
    return this.secretary === Secretary.graduados;
  }
}
