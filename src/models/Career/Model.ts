import { Column, DataType, Model, BelongsToMany, Table, HasOne } from "sequelize-typescript";
import { Applicant } from "../Applicant/Model";
import { CareerApplicant } from "../CareerApplicant/Model";

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

  @Column({
    allowNull: false,
    type: DataType.INTEGER
  })
  public credits: number;

  @BelongsToMany(() => Applicant, () => CareerApplicant)
  public applicants: Applicant[];

  @HasOne(() => CareerApplicant)
  public careerApplicant: CareerApplicant;
}
