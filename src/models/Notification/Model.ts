import { Model, Table, Column, ForeignKey, CreatedAt } from "sequelize-typescript";
import { BOOLEAN, TEXT, UUID, UUIDV4 } from "sequelize";
import { JobApplication, User } from "$models";
import { MultipleTypeNotificationError, MissingNotificationTypeError } from "./Errors";
import { isUuid } from "$models/SequelizeModelValidators";
import { compact } from "lodash";

@Table({
  tableName: "Notifications",
  timestamps: true,
  updatedAt: false,
  validate: {
    validateNotificationType(this: Notification) {
      const foreignKeys = [this.jobApplicationUuid];
      if (compact(foreignKeys).length > 1) throw new MultipleTypeNotificationError();
      if (compact(foreignKeys).length === 0) throw new MissingNotificationTypeError();
    }
  }
})
export class Notification extends Model<Notification> {
  @Column({ allowNull: false, primaryKey: true, type: UUID, defaultValue: UUIDV4, ...isUuid })
  public uuid: string;

  @ForeignKey(() => JobApplication)
  @Column({ allowNull: true, type: UUID, ...isUuid })
  public jobApplicationUuid: string;

  @ForeignKey(() => User)
  @Column({ allowNull: false, type: UUID, ...isUuid })
  public receiverUuid: string;

  @ForeignKey(() => User)
  @Column({ allowNull: false, type: UUID, ...isUuid })
  public senderUuid: string;

  @Column({ allowNull: true, type: TEXT })
  public message: string;

  @Column({ allowNull: true, type: BOOLEAN, defaultValue: true })
  public isNew: boolean;

  @CreatedAt
  @Column
  public createdAt: Date;
}
