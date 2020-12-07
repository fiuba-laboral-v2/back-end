import { Table, Column, ForeignKey, CreatedAt } from "sequelize-typescript";
import { BOOLEAN, TEXT, UUID, ENUM } from "sequelize";
import { Admin, JobApplication, Applicant } from "$models";
import { ApplicantNotificationType, applicantNotificationTypeEnumValues } from "./Interfaces";
import { isUuid, isApplicantNotificationType } from "$models/SequelizeModelValidators";
import { SequelizeModel } from "$models/SequelizeModel";

@Table({ tableName: "ApplicantNotifications", timestamps: true, updatedAt: false })
export class ApplicantNotificationSequelizeModel extends SequelizeModel<
  ApplicantNotificationSequelizeModel
> {
  @ForeignKey(() => Admin)
  @Column({ allowNull: false, type: UUID, ...isUuid })
  public moderatorUuid: string;

  @Column({ allowNull: true, type: TEXT })
  public moderatorMessage?: string;

  @Column({
    allowNull: false,
    type: ENUM({ values: applicantNotificationTypeEnumValues }),
    ...isApplicantNotificationType
  })
  public type: ApplicantNotificationType;

  @ForeignKey(() => Applicant)
  @Column({ allowNull: false, type: UUID, ...isUuid })
  public notifiedApplicantUuid: string;

  @Column({ allowNull: true, type: BOOLEAN, defaultValue: true })
  public isNew: boolean;

  @ForeignKey(() => JobApplication)
  @Column({ allowNull: true, type: UUID, ...isUuid })
  public jobApplicationUuid?: string;

  @CreatedAt
  @Column
  public createdAt: Date;
}
