import { Model, Table, Column, BelongsTo } from "sequelize-typescript";
import { UUID, UUIDV4, HasOneGetAssociationMixin, DATE } from "sequelize";
import { User } from "../User";

@Table({ tableName: "Admins" })
export class Admin extends Model<Admin> {
  @Column({
    allowNull: false,
    primaryKey: true,
    type: UUID,
    defaultValue: UUIDV4
  })
  public uuid: string;

  @Column({
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
