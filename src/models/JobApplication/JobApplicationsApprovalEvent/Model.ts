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
import { Admin, Offer, Applicant } from "$models";
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

  @ForeignKey(() => Offer)
  @Column({
    allowNull: false,
    references: { model: "Offers", key: "uuid" },
    type: UUID,
    ...isUuid
  })
  public offerUuid: string;

  @ForeignKey(() => Offer)
  @Column({
    allowNull: false,
    references: { model: "Applicants", key: "uuid" },
    type: UUID,
    ...isUuid
  })
  public applicantUuid: string;

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

  @BelongsTo(() => Offer, "offerUuid")
  public company: Offer;

  public getOffer: HasOneGetAssociationMixin<Offer>;
  public getApplicant: HasOneGetAssociationMixin<Applicant>;
  public getAdmin: HasOneGetAssociationMixin<Admin>;
}
