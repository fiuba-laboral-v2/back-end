import { BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { Applicant } from "../Applicant/Model";
import { Career } from "../Career/Model";
import { HasOneGetAssociationMixin, INTEGER } from "sequelize";
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
  public defaultScope: {
    exclude: ["createdAt", "updatedAt"]
  };

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

  @BelongsTo(() => Career, "careerCode")
  public career: Career;

  @BelongsTo(() => Applicant, "applicantUuid")
  public applicant: Applicant;

  public getCareer!: HasOneGetAssociationMixin<Career>;
  public getApplicant!: HasOneGetAssociationMixin<Applicant>;
}
