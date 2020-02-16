import { Table, Model, Column, ForeignKey, PrimaryKey } from "sequelize-typescript";
import { Applicant } from "../Applicant/Model";
import { Career } from "../Career/Model";

@Table({ tableName: "CareersApplicants" })
export class CareerApplicant extends Model<CareerApplicant> {
    @ForeignKey(() => Career)
    @PrimaryKey
    @Column
    public careerCode: string;

    @ForeignKey(() => Applicant)
    @PrimaryKey
    @Column
    public applicantUuid: string;
}
