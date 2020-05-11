import { BelongsTo, Column, ForeignKey, Is, Model, PrimaryKey, Table } from "sequelize-typescript";
import { Applicant } from "../Model";
import { validateURL } from "validations-fiuba-laboral-v2";
import { STRING, UUID } from "sequelize";

@Table({ tableName: "ApplicantsLinks" })
export class ApplicantLink extends Model<ApplicantLink> {
  @ForeignKey(() => Applicant)
  @PrimaryKey
  @Column({
    allowNull: false,
    type: UUID
  })
  public applicantUuid: string;

  @BelongsTo(() => Applicant)
  public applicant: Applicant;

  @PrimaryKey
  @Column({
    allowNull: false,
    type: STRING
  })
  public name: string;

  @Is(validateURL)
  @Column({
    allowNull: false,
    type: STRING
  })
  public url: string;
}
