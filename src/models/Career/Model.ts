import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({
  defaultScope: {
    attributes: { exclude: [ "deletedAt" ] }
  },
  paranoid: true,
  tableName: "Career"
})
export default class CareerModel extends Model<CareerModel> {
  @Column({
    allowNull: false,
    primaryKey: true,
    type: DataType.INTEGER
  })
  public code: string;

  @Column({
    allowNull: false,
    type: DataType.STRING
  })
  public description: string;

  @Column({
    allowNull: false,
    type: DataType.INTEGER
  })
  public credits: number;
}
