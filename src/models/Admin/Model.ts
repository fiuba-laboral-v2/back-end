import { Model, Table, Column, BelongsTo, ForeignKey } from "sequelize-typescript";
import { UUID, HasOneGetAssociationMixin, DATE, ENUM } from "sequelize";
import { User } from "..";
import { SecretaryEnumValues, Secretary } from "./Interface";
import { isSecretary } from "../SequelizeModelValidators";

@Table({ tableName: "Admins" })
export class Admin extends Model<Admin> {
  @ForeignKey(() => User)
  @Column({
    primaryKey: true,
    allowNull: false,
    references: { model: "Users", key: "uuid" },
    onDelete: "CASCADE",
    type: UUID,
  })
  public userUuid: string;

  @Column({
    allowNull: false,
    type: ENUM<string>({ values: SecretaryEnumValues }),
    ...isSecretary,
  })
  public secretary: Secretary;

  @Column({
    allowNull: false,
    type: DATE,
    defaultValue: new Date(),
  })
  public createdAt: Date;

  @Column({
    allowNull: false,
    type: DATE,
    defaultValue: new Date(),
  })
  public updatedAt: Date;

  @BelongsTo(() => User, "userUuid")
  public user: User;

  public getUser: HasOneGetAssociationMixin<User>;
}
