import { Model, Table, Column, ForeignKey, CreatedAt, BeforeCreate } from "sequelize-typescript";
import { BOOLEAN, TEXT, UUID, ENUM } from "sequelize";
import { Admin, JobApplication, Company } from "$models";
import { CompanyNotificationType, companyNotificationTypeEnumValues } from "./Interfaces";
import { isUuid, isCompanyNotificationType } from "$models/SequelizeModelValidators";
import { UuidGenerator } from "$models/UuidGenerator";

@Table({ tableName: "CompanyNotifications", timestamps: true, updatedAt: false })
export class CompanyNotification extends Model<CompanyNotification> {
  @BeforeCreate
  public static beforeCreateHook(companyNotification: CompanyNotification): void {
    companyNotification.uuid = UuidGenerator.generate();
  }

  @Column({ allowNull: true, primaryKey: true, type: UUID, ...isUuid })
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
  public notifiedCompanyUuid: string;

  @Column({ allowNull: true, type: BOOLEAN, defaultValue: true })
  public isNew: boolean;

  @ForeignKey(() => JobApplication)
  @Column({ allowNull: true, type: UUID, ...isUuid })
  public jobApplicationUuid?: string;

  @CreatedAt
  @Column
  public createdAt: Date;
}
