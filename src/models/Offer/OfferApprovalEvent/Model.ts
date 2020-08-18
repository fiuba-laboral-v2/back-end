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
import { Admin, Offer } from "$models";
import { isApprovalStatus } from "$models/SequelizeModelValidators";

@Table({ tableName: "OfferApprovalEvents", timestamps: true })
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

  @CreatedAt
  @Column
  public createdAt: Date;

  @UpdatedAt
  @Column
  public updatedAt: Date;

  @BelongsTo(() => Admin, "adminUserUuid")
  public admin: Admin;

  @BelongsTo(() => Offer, "offerUuid")
  public offer: Offer;

  public getOffer: HasOneGetAssociationMixin<Offer>;
  public getAdmin: HasOneGetAssociationMixin<Admin>;
}
