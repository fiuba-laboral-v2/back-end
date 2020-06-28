import { Column, Model, Table, BelongsTo, ForeignKey } from "sequelize-typescript";
import { DATE, UUID, UUIDV4, ENUM, HasOneGetAssociationMixin } from "sequelize";
import { ApprovalStatus, approvalStatuses } from "../../ApprovalStatus";
import { Applicant } from "../../Applicant/Model";
import { Admin } from "../../Admin/Model";
import { isUuid, isApprovalStatus } from "../../SequelizeModelValidators";

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
  public userUuid: string;

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

  @BelongsTo(() => Admin, "userUuid")
  public admin: Admin;

  @BelongsTo(() => Applicant, "applicantUuid")
  public applicant: Applicant;

  public getApplicant: HasOneGetAssociationMixin<Applicant>;
  public getAdmin: HasOneGetAssociationMixin<Admin>;
}
