import {
  BelongsTo,
  Column,
  CreatedAt,
  ForeignKey,
  Model,
  Table,
  UpdatedAt
} from "sequelize-typescript";
import { ENUM, HasOneGetAssociationMixin, UUID, UUIDV4 } from "sequelize";
import { ApprovalStatus, approvalStatuses } from "$models/ApprovalStatus";
import { Admin, JobApplication } from "$models";
import { isApprovalStatus, isUuid } from "$models/SequelizeModelValidators";

@Table({ tableName: "JobApplicationApprovalEvent", timestamps: true })
export class JobApplicationApprovalEvent extends Model<JobApplicationApprovalEvent> {
  @Column({
    allowNull: false,
    primaryKey: true,
    type: UUID,
    defaultValue: UUIDV4,
    ...isUuid
  })
  public uuid: string;

  @ForeignKey(() => JobApplication)
  @Column({
    allowNull: false,
    references: { model: "JobApplications", key: "uuid" },
    type: UUID,
    ...isUuid
  })
  public jobApplicationUuid: string;

  @ForeignKey(() => Admin)
  @Column({
    allowNull: false,
    references: { model: "Admins", key: "uuid" },
    type: UUID,
    ...isUuid
  })
  public adminUserUuid: string;

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

  @BelongsTo(() => Admin, "adminUserUuid")
  public admin: Admin;

  @BelongsTo(() => JobApplication, "jobApplicationUuid")
  public jobApplication: JobApplication;

  public getJobApplication: HasOneGetAssociationMixin<JobApplication>;
  public getAdmin: HasOneGetAssociationMixin<Admin>;
}
