import { BelongsTo, Column, ForeignKey, Model, Table } from "sequelize-typescript";
import { DATE, ENUM, HasOneGetAssociationMixin, UUID, UUIDV4 } from "sequelize";
import { ApprovalStatus, approvalStatuses } from "$models/ApprovalStatus";
import { Admin, Offer } from "$models";
import { isApprovalStatus } from "$models/SequelizeModelValidators";

@Table({ tableName: "OfferApprovalEvents" })
export class OfferApprovalEvent extends Model<OfferApprovalEvent> {
  @Column({
    allowNull: false,
    primaryKey: true,
    type: UUID,
    defaultValue: UUIDV4
  })
  public uuid: string;

  @ForeignKey(() => Admin)
  @Column({
    allowNull: false,
    references: { model: "Admins", key: "uuid" },
    type: UUID
  })
  public adminUserUuid: string;

  @ForeignKey(() => Offer)
  @Column({
    allowNull: false,
    references: { model: "Offers", key: "uuid" },
    type: UUID
  })
  public offerUuid: string;

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

  @BelongsTo(() => Offer, "offerUuid")
  public company: Offer;

  public getOffer: HasOneGetAssociationMixin<Offer>;
  public getAdmin: HasOneGetAssociationMixin<Admin>;
}
