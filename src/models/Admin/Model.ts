import {
  BelongsTo,
  Column,
  CreatedAt,
  ForeignKey,
  Model,
  Table,
  UpdatedAt
} from "sequelize-typescript";
import { ENUM, HasOneGetAssociationMixin, UUID } from "sequelize";
import { User } from "..";
import { Secretary, SecretaryEnumValues } from "./Interface";
import { isSecretary } from "../SequelizeModelValidators";

@Table({ tableName: "Admins", timestamps: true })
export class Admin extends Model<Admin> {
  @ForeignKey(() => User)
  @Column({
    primaryKey: true,
    allowNull: false,
    references: { model: "Users", key: "uuid" },
    onDelete: "CASCADE",
    type: UUID
  })
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

  @BelongsTo(() => User, "userUuid")
  public user: User;

  public getUser: HasOneGetAssociationMixin<User>;

  public isFromExtensionSecretary() {
    return this.secretary === Secretary.extension;
  }

  public isFromGraduadosSecretary() {
    return this.secretary === Secretary.graduados;
  }
}
