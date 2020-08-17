import { BelongsTo, Column, ForeignKey, Model, Table } from "sequelize-typescript";
import { ENUM, HasOneGetAssociationMixin, UUID } from "sequelize";
import { Applicant, Offer } from "$models";
import { ApprovalStatus, approvalStatuses } from "$models/ApprovalStatus";
import { isApprovalStatus, isUuid } from "$models/SequelizeModelValidators";

@Table({ tableName: "JobApplications" })
export class JobApplication extends Model<JobApplication> {
  @ForeignKey(() => Offer)
  @Column({
    allowNull: false,
    primaryKey: true,
    type: UUID,
    ...isUuid
  })
  public offerUuid: string;

  @BelongsTo(() => Offer, "offerUuid")
  public offer: Offer;

  @ForeignKey(() => Applicant)
  @Column({
    allowNull: false,
    primaryKey: true,
    type: UUID,
    ...isUuid
  })
  public applicantUuid: string;

  @Column({
    allowNull: false,
    type: ENUM<string>({ values: approvalStatuses }),
    defaultValue: ApprovalStatus.pending,
    ...isApprovalStatus
  })
  public extensionApprovalStatus: ApprovalStatus;

  @Column({
    allowNull: false,
    type: ENUM<string>({ values: approvalStatuses }),
    defaultValue: ApprovalStatus.pending,
    ...isApprovalStatus
  })
  public graduadosApprovalStatus: ApprovalStatus;

  @BelongsTo(() => Applicant, "applicantUuid")
  public applicant: Applicant;

  public getOffer: HasOneGetAssociationMixin<Offer>;
  public getApplicant: HasOneGetAssociationMixin<Applicant>;
}
