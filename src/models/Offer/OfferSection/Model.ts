import { Column, DataType, Model, Table, ForeignKey, BelongsTo } from "sequelize-typescript";
import { Offer } from "../Model";

@Table({ tableName: "OffersSections" })
export class OfferSection extends Model<OfferSection> {
  @Column({
    allowNull: false,
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4
  })
  public uuid: string;

  @ForeignKey(() => Offer)
  @Column({
    allowNull: false,
    type: DataType.UUID
  })
  public offerUuid: string;

  @BelongsTo(() => Offer)
  public offer: Offer;

  @Column({
    allowNull: false,
    type: DataType.TEXT
  })
  public title: string;

  @Column({
    allowNull: false,
    type: DataType.TEXT
  })
  public text: string;

  @Column({
    allowNull: false,
    autoIncrement: true,
    type: DataType.INTEGER
  })
  public displayOrder: number;
}
