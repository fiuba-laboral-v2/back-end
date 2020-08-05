import { BelongsTo, Column, ForeignKey, Model, Table } from "sequelize-typescript";
import { DATE, ENUM, HasOneGetAssociationMixin, UUID, UUIDV4 } from "sequelize";
import { ApprovalStatus, approvalStatuses } from "$models/ApprovalStatus";
import { Admin, Applicant } from "$models";
import { isApprovalStatus, isUuid } from "$models/SequelizeModelValidators";

@Table({ tableName: "ApplicantApprovalEvents" })
export class ApplicantApprovalEvent extends Model<ApplicantApprovalEvent> {
  @Column({
    allowNull: false,
    primaryKey: true,
    type: UUID,
    defaultValue: UUIDV4,
    ...isUuid
  })
  public uuid: string;

  @ForeignKey(() => Admin)
  @Column({
    allowNull: false,
    references: { model: "Admins", key: "uuid" },
    type: UUID,
    ...isUuid
  })
  public adminUserUuid: string;

  @ForeignKey(() => Applicant)
  @Column({
    allowNull: false,
    references: { model: "Applicants", key: "uuid" },
    type: UUID,
    ...isUuid
  })
  public applicantUuid: string;

  @Column({
    allowNull: false,
    type: ENUM<string>({ values: approvalStatuses }),
    ...isApprovalStatus
  })
  public status: ApprovalStatus;

  @Column({
    allowNull: false,
    type: DATE,
    defaultValue: new Date()
  })
  public createdAt: Date;

  @Column({
    allowNull: false,
    type: DATE,
    defaultValue: new Date()
  })
  public updatedAt: Date;

  @BelongsTo(() => Admin, "adminUserUuid")
  public admin: Admin;

  @BelongsTo(() => Applicant, "applicantUuid")
  public applicant: Applicant;

  public getApplicant: HasOneGetAssociationMixin<Applicant>;
  public getAdmin: HasOneGetAssociationMixin<Admin>;
}
