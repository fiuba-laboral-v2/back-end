import { BelongsTo, Column, ForeignKey, Model, Table } from "sequelize-typescript";
import { HasOneGetAssociationMixin, UUID } from "sequelize";

import { Offer } from "../Offer/Model";
import { Applicant } from "../Applicant/Model";

@Table({ tableName: "JobApplications" })
export class JobApplication extends Model<JobApplication> {
  @ForeignKey(() => Offer)
  @Column({
    allowNull: false,
    primaryKey: true,
    type: UUID
  })
  public offerUuid: string;

  @BelongsTo(() => Offer, "offerUuid")
  public offer: Offer;

  @ForeignKey(() => Applicant)
  @Column({
    allowNull: false,
    primaryKey: true,
    type: UUID
  })
  public applicantUuid: string;

  @BelongsTo(() => Applicant, "applicantUuid")
  public applicant: Applicant;

  public getOffer: HasOneGetAssociationMixin<Offer>;
  public getApplicant: HasOneGetAssociationMixin<Applicant>;
}
