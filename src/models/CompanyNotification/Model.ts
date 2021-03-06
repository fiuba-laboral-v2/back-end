import { Table, Column, ForeignKey, CreatedAt } from "sequelize-typescript";
import { BOOLEAN, TEXT, UUID, ENUM } from "sequelize";
import { Admin, JobApplication, Company, Offer } from "$models";
import { CompanyNotificationType, companyNotificationTypeEnumValues } from "./Interfaces";
import { isUuid, isCompanyNotificationType, isSecretary } from "$models/SequelizeModelValidators";
import { SequelizeModel, Nullable } from "$models/SequelizeModel";
import { Secretary, SecretaryEnumValues } from "$models/Admin";

@Table({ tableName: "CompanyNotifications", timestamps: true, updatedAt: false })
export class CompanyNotificationSequelizeModel extends SequelizeModel<
  CompanyNotificationSequelizeModel
> {
  @ForeignKey(() => Admin)
  @Column({ allowNull: false, type: UUID, ...isUuid })
  public moderatorUuid: string;

  @Column({ allowNull: true, type: TEXT })
  public moderatorMessage: Nullable<string>;

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
  public isNew: Nullable<boolean>;

  @ForeignKey(() => JobApplication)
  @Column({ allowNull: true, type: UUID, ...isUuid })
  public jobApplicationUuid: Nullable<string>;

  @ForeignKey(() => Offer)
  @Column({ allowNull: true, type: UUID, ...isUuid })
  public offerUuid: Nullable<string>;

  @Column({
    allowNull: true,
    type: ENUM<string>({ values: SecretaryEnumValues }),
    ...isSecretary
  })
  public secretary: Nullable<Secretary>;

  @CreatedAt
  @Column
  public createdAt: Date;
}
