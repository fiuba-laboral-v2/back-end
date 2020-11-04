import { Model, Table, Column, ForeignKey, CreatedAt } from "sequelize-typescript";
import { BOOLEAN, TEXT, UUID, UUIDV4 } from "sequelize";
import { Admin, Applicant, User } from "$models";
import { NotificationHasNoTaskForeignKeyError } from "./Errors";
import { isUuid } from "$models/SequelizeModelValidators";
import { compact } from "lodash";

@Table({
  tableName: "Notifications",
  timestamps: true,
  validate: {
    validateTaskForeignKey(this: Notification) {
      const foreignKeys = [this.applicantUuid];
      if (compact(foreignKeys).length !== 1) throw new NotificationHasNoTaskForeignKeyError();
    }
  }
})
export class Notification extends Model<Notification> {
  @Column({ allowNull: false, primaryKey: true, type: UUID, defaultValue: UUIDV4, ...isUuid })
  public uuid: string;

  @ForeignKey(() => Applicant)
  @Column({ allowNull: true, type: UUID, ...isUuid })
  public applicantUuid: string;

  @ForeignKey(() => User)
  @Column({ allowNull: false, type: UUID, ...isUuid })
  public userUuid: string;

  @ForeignKey(() => Admin)
  @Column({ allowNull: false, type: UUID, ...isUuid })
  public adminUserUuid: string;

  @Column({ allowNull: true, type: TEXT })
  public message: string;

  @Column({ allowNull: true, type: BOOLEAN, defaultValue: true })
  public isNew: string;

  @CreatedAt
  @Column
  public createdAt: Date;
}
