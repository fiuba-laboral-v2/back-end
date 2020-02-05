import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({
  defaultScope: {
    attributes: { exclude: [ "deletedAt" ] }
  },
  paranoid: true,
  tableName: "Capabilities"
})
export default class CapabilityModel extends Model<CapabilityModel> {
  @Column({
    allowNull: false,
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4
  })
  public code: string;

  @Column({
    allowNull: false,
    type: DataType.STRING
  })
  public description: string;
}
