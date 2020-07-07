import { Column, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { Applicant, Capability } from "..";

@Table({ tableName: "ApplicantsCapabilities" })
export class ApplicantCapability extends Model<ApplicantCapability> {
  @ForeignKey(() => Applicant)
  @PrimaryKey
  @Column
  public applicantUuid: string;

  @ForeignKey(() => Capability)
  @PrimaryKey
  @Column
  public capabilityUuid: string;
}
