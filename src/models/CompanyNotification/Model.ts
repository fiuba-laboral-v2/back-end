import { Table, Column, ForeignKey, CreatedAt } from "sequelize-typescript";
import { BOOLEAN, TEXT, UUID, ENUM } from "sequelize";
import { Admin, JobApplication, Company, Offer } from "$models";
import { CompanyNotificationType, companyNotificationTypeEnumValues } from "./Interfaces";
import { isUuid, isCompanyNotificationType } from "$models/SequelizeModelValidators";
import { SequelizeModel } from "$models/SequelizeModel";

@Table({ tableName: "CompanyNotifications", timestamps: true, updatedAt: false })
export class CompanyNotification extends SequelizeModel<CompanyNotification> {
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

  @ForeignKey(() => Offer)
  @Column({ allowNull: true, type: UUID, ...isUuid })
  public offerUuid?: string;

  @CreatedAt
  @Column
  public createdAt: Date;
}
