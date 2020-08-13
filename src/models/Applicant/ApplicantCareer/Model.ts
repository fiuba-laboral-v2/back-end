import { BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { Applicant, Career } from "$models";
import { HasOneGetAssociationMixin, INTEGER, BOOLEAN, DATE } from "sequelize";
import { validateIntegerInRange } from "validations-fiuba-laboral-v2";

@Table({
  tableName: "ApplicantCareers",
  validate: {
    async validateCreditsCount(this: ApplicantCareer) {
      const validate = validateIntegerInRange({
        min: {
          value: 0,
          include: true
        },
        max: {
          value: (await this.getCareer()).credits,
          include: true
        }
      });
      validate(this.creditsCount);
    }
  }
})
export class ApplicantCareer extends Model<ApplicantCareer> {
  @ForeignKey(() => Career)
  @PrimaryKey
  @Column
  public careerCode: string;

  @ForeignKey(() => Applicant)
  @PrimaryKey
  @Column
  public applicantUuid: string;

  @Column({
    allowNull: false,
    type: INTEGER
  })
  public creditsCount: number;

  @Column({
    allowNull: false,
    type: BOOLEAN
  })
  public isGraduate: boolean;

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

  @BelongsTo(() => Career, "careerCode")
  public career: Career;

  @BelongsTo(() => Applicant, "applicantUuid")
  public applicant: Applicant;

  public getCareer!: HasOneGetAssociationMixin<Career>;
  public getApplicant!: HasOneGetAssociationMixin<Applicant>;
}
