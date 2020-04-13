import { BelongsTo, Column, DataType, ForeignKey, Is, Model, Table } from "sequelize-typescript";
import { Applicant } from "../Model";
import { validateURL } from "validations-fiuba-laboral-v2";

@Table({ tableName: "ApplicantsLinks" })
export class ApplicantLink extends Model<ApplicantLink> {
  @Column({
    allowNull: false,
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4
  })
  public uuid: string;

  @ForeignKey(() => Applicant)
  @Column({
    allowNull: false,
    type: DataType.UUID
  })
  public applicantUuid: string;

  @BelongsTo(() => Applicant)
  public applicant: Applicant;

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
