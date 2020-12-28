import { Column, CreatedAt, ForeignKey, Model, Table, UpdatedAt } from "sequelize-typescript";
import { ENUM, TEXT, UUID, UUIDV4 } from "sequelize";
import { ApprovalStatus, approvalStatuses } from "$models/ApprovalStatus";
import { Admin, Applicant } from "$models";
import { Nullable } from "$models/SequelizeModel";
import { isApprovalStatus, isUuid } from "$models/SequelizeModelValidators";

@Table({ tableName: "ApplicantApprovalEvents", timestamps: true })
export class ApplicantApprovalEvent extends Model<ApplicantApprovalEvent> {
  @Column({ allowNull: false, primaryKey: true, type: UUID, defaultValue: UUIDV4, ...isUuid })
  public uuid: string;

  @ForeignKey(() => Admin)
  @Column({ allowNull: false, type: UUID, ...isUuid })
  public adminUserUuid: string;

  @ForeignKey(() => Applicant)
  @Column({ allowNull: false, type: UUID, ...isUuid })
  public applicantUuid: string;

  @Column({ allowNull: true, type: TEXT })
  public moderatorMessage: Nullable<string>;

  @Column({
    allowNull: false,
    type: ENUM<string>({ values: approvalStatuses }),
    ...isApprovalStatus
  })
  public status: ApprovalStatus;

  @CreatedAt
  @Column
  public createdAt: Date;

  @UpdatedAt
  @Column
  public updatedAt: Date;
}
