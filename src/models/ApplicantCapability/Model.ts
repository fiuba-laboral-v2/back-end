import { Table, Model, Column, ForeignKey, PrimaryKey } from "sequelize-typescript";
import { Capability } from "../Capability/Model";
import { Applicant } from "../Applicant/Model";

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
