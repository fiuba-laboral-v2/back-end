import {
  BelongsToMany,
  Column,
  CreatedAt,
  HasMany,
  Model,
  Table,
  UpdatedAt
} from "sequelize-typescript";
import { Applicant, ApplicantCareer } from "$models";
import { STRING } from "sequelize";

@Table({ tableName: "Careers", timestamps: true })
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

  @CreatedAt
  @Column
  public createdAt: Date;

  @UpdatedAt
  @Column
  public updatedAt: Date;

  @BelongsToMany(() => Applicant, () => ApplicantCareer)
  public applicants: Applicant[];

  @HasMany(() => ApplicantCareer)
  public applicantCareers: ApplicantCareer[];
}
