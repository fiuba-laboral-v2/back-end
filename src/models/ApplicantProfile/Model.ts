import { Column, DataType, HasMany, Model, Table } from "sequelize-typescript";
import { CareerModel } from "../Career";
import { CapabilityModel } from "../Capability";

@Table({
  defaultScope: {
    attributes: { exclude: [ "deletedAt" ] }
  },
  paranoid: true,
  tableName: "ApplicantProfile"
})
export default class ApplicantProfile extends Model<ApplicantProfile> {
  @Column({
    allowNull: false,
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4
  })
  public uuid: string;

  @Column({
    allowNull: false,
    type: DataType.TEXT
  })
  public name: string;

  @Column({
    allowNull: false,
    type: DataType.TEXT
  })
  public surname: string;

  @Column({
    allowNull: false,
    type: DataType.INTEGER
  })
  public padron: number;

  @Column({
    allowNull: false,
    type: DataType.TEXT
  })
  public description: string;

  @Column({
    allowNull: false,
    type: DataType.INTEGER
  })
  public credits: number;

  @HasMany(() => CareerModel)
  public careers: CareerModel[];

  @HasMany(() => CapabilityModel)
  public capabilities: CapabilityModel[];
}
