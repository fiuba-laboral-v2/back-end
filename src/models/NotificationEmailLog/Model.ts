import { Column, CreatedAt, Table } from "sequelize-typescript";
import { BOOLEAN, TEXT } from "sequelize";
import { SequelizeModel } from "$models/SequelizeModel";

@Table({ tableName: "NotificationEmailLogs", timestamps: true, updatedAt: false })
export class NotificationEmailLog extends SequelizeModel<NotificationEmailLog> {
  @Column({ allowNull: false, type: TEXT })
  public notificationUuid: string;

  @Column({ allowNull: false, type: TEXT })
  public notificationTable: string;

  @Column({ allowNull: false, type: BOOLEAN })
  public success: boolean;

  @Column({ allowNull: false, type: TEXT })
  public message: boolean;

  @CreatedAt
  @Column
  public createdAt: Date;
}
