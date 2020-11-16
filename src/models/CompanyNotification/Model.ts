import { Model, Table, Column, ForeignKey, CreatedAt } from "sequelize-typescript";
import { BOOLEAN, TEXT, UUID, UUIDV4, ENUM } from "sequelize";
import { Admin, JobApplication, Company } from "$models";
import { CompanyNotificationType, companyNotificationTypeEnumValues } from "./Interfaces";
import { isUuid, isCompanyNotificationType } from "$models/SequelizeModelValidators";

@Table({ tableName: "CompanyNotifications", timestamps: true, updatedAt: false })
export class CompanyNotification extends Model<CompanyNotification> {
  @Column({ allowNull: false, primaryKey: true, type: UUID, defaultValue: UUIDV4, ...isUuid })
  public uuid: string;

  @ForeignKey(() => Admin)
  @Column({ allowNull: false, type: UUID, ...isUuid })
  public moderatorUuid: string;

  @Column({ allowNull: true, type: TEXT })
  public moderatorMessage?: string;

  @Column({
    allowNull: false,
    type: ENUM({ values: companyNotificationTypeEnumValues }),
    ...isCompanyNotificationType
  })
  public type: CompanyNotificationType;

  @ForeignKey(() => Company)
  @Column({ allowNull: false, type: UUID, ...isUuid })
  public companyUuid: string;

  @Column({ allowNull: true, type: BOOLEAN, defaultValue: true })
  public isNew: boolean;

  @ForeignKey(() => JobApplication)
  @Column({ allowNull: true, type: UUID, ...isUuid })
  public jobApplicationUuid?: string;

  @CreatedAt
  @Column
  public createdAt: Date;
}
