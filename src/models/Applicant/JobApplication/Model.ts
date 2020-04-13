import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { HasOneGetAssociationMixin } from "sequelize";

import { Offer } from "../../Offer/Model";
import { Applicant } from "../Model";

@Table({ tableName: "JobApplications" })
export class JobApplication extends Model<JobApplication> {
  @ForeignKey(() => Offer)
  @Column({
    allowNull: false,
    primaryKey: true,
    type: DataType.UUID
  })
  public offerUuid: string;

  @BelongsTo(() => Offer, "offerUuid")
  public offer: Offer;

  @ForeignKey(() => Applicant)
  @Column({
    allowNull: false,
    primaryKey: true,
    type: DataType.UUID
  })
  public applicantUuid: string;

  @BelongsTo(() => Applicant, "applicantUuid")
  public applicant: Applicant;

  public getOffer: HasOneGetAssociationMixin<Offer>;
  public getApplicant: HasOneGetAssociationMixin<Applicant>;
}
