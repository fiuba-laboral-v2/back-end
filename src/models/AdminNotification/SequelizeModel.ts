import { Table, Column, ForeignKey, CreatedAt } from "sequelize-typescript";
import { BOOLEAN, UUID, ENUM } from "sequelize";
import { Company } from "$models";
import { AdminNotificationType, adminNotificationTypeEnumValues } from "./Interfaces";
import { isUuid, isAdminNotificationType, isSecretary } from "$models/SequelizeModelValidators";
import { Secretary, SecretaryEnumValues } from "$models/Admin";
import { Nullable } from "$models/SequelizeModel";
import { SequelizeModel } from "$models/SequelizeModel";

@Table({ tableName: "AdminNotifications", timestamps: true, updatedAt: false })
export class AdminNotificationSequelizeModel extends SequelizeModel<
  AdminNotificationSequelizeModel
> {
  @Column({
    allowNull: false,
    type: ENUM<string>({ values: SecretaryEnumValues }),
    ...isSecretary
  })
  public secretary: Secretary;

  @ForeignKey(() => Company)
  @Column({ allowNull: true, type: UUID, ...isUuid })
  public companyUuid: Nullable<string>;

  @Column({
    allowNull: false,
    type: ENUM({ values: adminNotificationTypeEnumValues }),
    ...isAdminNotificationType
  })
  public type: AdminNotificationType;

  @Column({ allowNull: false, type: BOOLEAN, defaultValue: true })
  public isNew: boolean;

  @CreatedAt
  @Column
  public createdAt: Date;
}
