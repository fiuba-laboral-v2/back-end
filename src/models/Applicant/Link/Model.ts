import {
  Column,
  DataType,
  Model,
  Table,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { Applicant } from "../Model";

@Table({
  tableName: "ApplicantsLinks"
})
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

  @Column({
    allowNull: false,
    type: DataType.STRING
  })
  public url: string;
}
