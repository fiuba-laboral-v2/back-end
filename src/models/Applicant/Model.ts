import { Column, DataType, BelongsToMany, Model, Table } from "sequelize-typescript";
import { Career } from "../Career/Model";
import { CareerApplicant } from "../CareerApplicant/Model";

@Table({
  defaultScope: {
    attributes: { exclude: [ "deletedAt" ] }
  },
  paranoid: true,
  tableName: "Applicant"
})
export class Applicant extends Model<Applicant> {
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

  @BelongsToMany(() => Career, () => CareerApplicant)
  public careers: Career[];
}
