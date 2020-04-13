import { BelongsToMany, Column, DataType, HasMany, Is, Model, Table } from "sequelize-typescript";
import { Applicant } from "../Applicant/Model";
import { CareerApplicant } from "../CareerApplicant/Model";
import { validateIntegerInRange } from "validations-fiuba-laboral-v2";

@Table({ tableName: "Careers" })
export class Career extends Model<Career> {
  @Column({
    allowNull: false,
    primaryKey: true,
    type: DataType.STRING
  })
  public code: string;

  @Column({
    allowNull: false,
    type: DataType.STRING
  })
  public description: string;

  @Is("credits", validateIntegerInRange({ min: { value: 0, include: false } }))
  @Column({
    allowNull: false,
    type: DataType.INTEGER
  })
  public credits: number;

  @BelongsToMany(() => Applicant, () => CareerApplicant)
  public applicants: Applicant[];

  @HasMany(() => CareerApplicant)
  public careersApplicants: CareerApplicant[];
}
