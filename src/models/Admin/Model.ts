import { Model, Table, Column, BelongsTo, ForeignKey } from "sequelize-typescript";
import { UUID, HasOneGetAssociationMixin, DATE } from "sequelize";
import { User } from "../User";

@Table({ tableName: "Admins" })
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
    type: DATE,
    defaultValue: new Date(Date.now())
  })
  public createdAt: Date;

  @Column({
    allowNull: false,
    type: DATE,
    defaultValue: new Date(Date.now())
  })
  public updatedAt: Date;

  @BelongsTo(() => User, "userUuid")
  public user: User;

  public getUser: HasOneGetAssociationMixin<User>;
}
