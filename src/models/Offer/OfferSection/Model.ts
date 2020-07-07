import { BelongsTo, Column, ForeignKey, Model, Table } from "sequelize-typescript";
import { Offer } from "../..";
import { INTEGER, TEXT, UUID, UUIDV4 } from "sequelize";

@Table({ tableName: "OffersSections" })
export class OfferSection extends Model<OfferSection> {
  @Column({
    allowNull: false,
    primaryKey: true,
    type: UUID,
    defaultValue: UUIDV4
  })
  public uuid: string;

  @ForeignKey(() => Offer)
  @Column({
    allowNull: false,
    type: UUID
  })
  public offerUuid: string;

  @BelongsTo(() => Offer)
  public offer: Offer;

  @Column({
    allowNull: false,
    type: TEXT
  })
  public title: string;

  @Column({
    allowNull: false,
    type: TEXT
  })
  public text: string;

  @Column({
    allowNull: false,
    autoIncrement: true,
    type: INTEGER
  })
  public displayOrder: number;
}
