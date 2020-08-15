import { BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { Applicant, Career } from "$models";
import {
  MissingApprovedSubjectCountError,
  MissingCurrentCareerYearError,
  ForbiddenApprovedSubjectCountError,
  ForbiddenCurrentCareerYearError
} from "./Errors";
import { HasOneGetAssociationMixin, INTEGER, BOOLEAN, DATE, UUID, STRING } from "sequelize";
import { isUuid, optional } from "$models/SequelizeModelValidators";
import { validateIntegerInRange } from "validations-fiuba-laboral-v2";

@Table({
  tableName: "ApplicantCareers",
  validate: {
    validateApplicantCareer(this: ApplicantCareer) {
      this.validateApplicantCareer();
    }
  }
})
export class ApplicantCareer extends Model<ApplicantCareer> {
  @ForeignKey(() => Career)
  @PrimaryKey
  @Column({
    allowNull: false,
    type: STRING,
    references: { model: Career.tableName, key: "code" },
    onDelete: "CASCADE"
  })
  public careerCode: string;

  @ForeignKey(() => Applicant)
  @PrimaryKey
  @Column({
    allowNull: false,
    type: UUID,
    references: { model: Applicant.tableName, key: "uuid" },
    onDelete: "CASCADE",
    ...isUuid
  })
  public applicantUuid: string;

  @Column({
    allowNull: true,
    type: INTEGER,
    ...optional(validateIntegerInRange({ min: { value: 0, include: false } }))
  })
  public currentCareerYear: number;

  @Column({
    allowNull: true,
    type: INTEGER,
    ...optional(validateIntegerInRange({ min: { value: 0, include: true } }))
  })
  public approvedSubjectCount: number;

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

  public validateApplicantCareer() {
    if (this.isGraduate) {
      if (this.approvedSubjectCount) throw new ForbiddenApprovedSubjectCountError();
      if (this.currentCareerYear) throw new ForbiddenCurrentCareerYearError();
    } else {
      if (!this.approvedSubjectCount) throw new MissingApprovedSubjectCountError();
      if (!this.currentCareerYear) throw new MissingCurrentCareerYearError();
    }
  }
}
