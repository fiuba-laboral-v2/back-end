import {
  Table,
  Model,
  Column,
  ForeignKey,
  PrimaryKey,
  DataType
} from "sequelize-typescript";
import { Applicant } from "../Applicant/Model";
import { Career } from "../Career/Model";

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
}
