import {
  Table,
  Model,
  Column,
  ForeignKey,
  PrimaryKey,
  DataType,
  BelongsTo
} from "sequelize-typescript";
import { Applicant } from "../Applicant/Model";
import { Career } from "../Career/Model";
import { HasOneGetAssociationMixin } from "sequelize";

@Table({ tableName: "CareersApplicants" })
export class CareerApplicant extends Model<CareerApplicant> {
  public defaultScope: {
    exclude: [ "createdAt", "updatedAt" ]
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
    type: DataType.INTEGER
  })
  public creditsCount: number;

  @BelongsTo(() => Career, "careerCode")
  public career: Career;

  @BelongsTo(() => Applicant, "applicantUuid")
  public applicant: Applicant;

  public getCareer!: HasOneGetAssociationMixin<Career>;
  public getApplicant!: HasOneGetAssociationMixin<Applicant>;
}
