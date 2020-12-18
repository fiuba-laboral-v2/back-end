import { Column, CreatedAt, ForeignKey, Model, Table, UpdatedAt } from "sequelize-typescript";
import { ENUM, UUID, UUIDV4, TEXT } from "sequelize";
import { ApprovalStatus, approvalStatuses } from "$models/ApprovalStatus";
import { Admin, JobApplication } from "$models";
import { isApprovalStatus, isUuid } from "$models/SequelizeModelValidators";

@Table({ tableName: "JobApplicationApprovalEvents", timestamps: true })
export class JobApplicationApprovalEvent extends Model<JobApplicationApprovalEvent> {
  @Column({ allowNull: false, primaryKey: true, type: UUID, defaultValue: UUIDV4, ...isUuid })
  public uuid: string;

  @ForeignKey(() => JobApplication)
  @Column({ allowNull: false, type: UUID, ...isUuid })
  public jobApplicationUuid: string;

  @ForeignKey(() => Admin)
  @Column({ allowNull: false, type: UUID, ...isUuid })
  public adminUserUuid: string;

  @Column({ allowNull: true, type: TEXT })
  public moderatorMessage?: string;

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
