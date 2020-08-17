import { BelongsToMany, Column, HasMany, Model, Table } from "sequelize-typescript";
import { Applicant, ApplicantCareer } from "$models";
import { DATE, STRING } from "sequelize";

@Table({ tableName: "Careers" })
export class Career extends Model<Career> {
  @Column({
    allowNull: false,
    primaryKey: true,
    type: STRING
  })
  public code: string;

  @Column({
    allowNull: false,
    type: STRING
  })
  public description: string;

  @Column({
    allowNull: false,
    type: DATE,
    defaultValue: new Date()
  })
  public createdAt: Date;

  @Column({
    allowNull: false,
    type: DATE,
    defaultValue: new Date()
  })
  public updatedAt: Date;

  @BelongsToMany(() => Applicant, () => ApplicantCareer)
  public applicants: Applicant[];

  @HasMany(() => ApplicantCareer)
  public applicantCareers: ApplicantCareer[];
}
