import { Column, DataType, Model, BelongsToMany, Table } from "sequelize-typescript";
import { Applicant } from "../Applicant/Model";
import { CareerApplicant } from "../CareerApplicant/Model";

@Table({
  defaultScope: {
    attributes: { exclude: [ "deletedAt" ] }
  },
  paranoid: true,
  tableName: "Career"
})
export class Career extends Model<Career> {
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

  @BelongsToMany(() => Applicant, () => CareerApplicant)
  public applicants: Applicant[];
}
