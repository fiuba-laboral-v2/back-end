import { BelongsTo, Column, ForeignKey, Model, Table } from "sequelize-typescript";
import { Career, Offer } from "$models";
import { INTEGER, UUID } from "sequelize";

@Table({ tableName: "OffersCareers" })
export class OfferCareer extends Model<OfferCareer> {
  @ForeignKey(() => Career)
  @Column({
    allowNull: false,
    primaryKey: true,
    type: INTEGER
  })
  public careerCode: string;

  @BelongsTo(() => Career)
  public career: Career;

  @ForeignKey(() => Offer)
  @Column({
    allowNull: false,
    primaryKey: true,
    type: UUID
  })
  public offerUuid: string;

  @BelongsTo(() => Offer)
  public offer: Offer;
}
