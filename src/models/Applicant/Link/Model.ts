import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Is,
  Model,
  Table,
  PrimaryKey
} from "sequelize-typescript";
import { Applicant } from "../Model";
import { validateURL } from "validations-fiuba-laboral-v2";

@Table({ tableName: "ApplicantsLinks" })
export class ApplicantLink extends Model<ApplicantLink> {
  @ForeignKey(() => Applicant)
  @PrimaryKey
  @Column({
    allowNull: false,
    type: DataType.UUID
  })
  public applicantUuid: string;

  @BelongsTo(() => Applicant)
  public applicant: Applicant;

  @PrimaryKey
  @Column({
    allowNull: false,
    type: DataType.STRING
  })
  public name: string;

  @Is(validateURL)
  @Column({
    allowNull: false,
    type: DataType.STRING
  })
  public url: string;
}
