import { Column, CreatedAt, Table } from "sequelize-typescript";
import { BOOLEAN, TEXT, UUID, STRING } from "sequelize";
import { SequelizeModel } from "$models/SequelizeModel";
import { isUuid } from "$models/SequelizeModelValidators";

@Table({ tableName: "NotificationEmailLogs", timestamps: true, updatedAt: false })
export class NotificationEmailLog extends SequelizeModel<NotificationEmailLog> {
  @Column({ allowNull: false, type: UUID, ...isUuid })
  public notificationUuid: string;

  @Column({ allowNull: false, type: STRING })
  public notificationTable: string;

  @Column({ allowNull: false, type: BOOLEAN })
  public success: boolean;

  @Column({ allowNull: false, type: TEXT })
  public message: boolean;

  @CreatedAt
  @Column
  public createdAt: Date;
}
