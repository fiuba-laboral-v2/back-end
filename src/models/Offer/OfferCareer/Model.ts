import { Column, DataType, Model, Table, ForeignKey, BelongsTo } from "sequelize-typescript";
import { Offer } from "../Model";
import { Career } from "../../Career/Model";

@Table({ tableName: "OffersCareers" })
export class OfferCareer extends Model<OfferCareer> {
  @Column({
    allowNull: false,
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4
  })
  public uuid: string;

  @ForeignKey(() => Career)
  @Column({
    allowNull: false,
    unique: true,
    type: DataType.INTEGER
  })
  public careerCode: string;

  @BelongsTo(() => Career)
  public career: Career;

  @ForeignKey(() => Offer)
  @Column({
    allowNull: false,
    unique: true,
    type: DataType.UUID
  })
  public offerUuid: string;

  @BelongsTo(() => Offer)
  public offer: Offer;
}
