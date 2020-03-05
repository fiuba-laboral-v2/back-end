import { Column, DataType, BelongsToMany, Model, Table, Is } from "sequelize-typescript";
import {
  HasManyGetAssociationsMixin, Transaction
} from "sequelize";
import { IApplicantCareer } from "./Interface";
import { validateName } from "validations-fiuba-laboral-v2";
import { Career } from "../Career/Model";
import { CareerApplicant } from "../CareerApplicant/Model";
import { Capability } from "../Capability/Model";
import { ApplicantCapability } from "../ApplicantCapability/Model";
import find from "lodash/find";


@Table({
  tableName: "Applicants"
 })
export class Applicant extends Model<Applicant> {
  @Column({
    allowNull: false,
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4
  })
  public uuid: string;

  @Is("name", validateName)
  @Column({
    allowNull: false,
    type: DataType.TEXT
  })
  public name: string;

  @Column({
    allowNull: false,
    type: DataType.TEXT
  })
  public surname: string;

  @Column({
    allowNull: false,
    type: DataType.INTEGER
  })
  public padron: number;

  @Column({
    allowNull: true,
    type: DataType.TEXT
  })
  public description: string;

  @BelongsToMany(() => Career, () => CareerApplicant)
  public careers: Career[];

  @BelongsToMany(() => Capability, () => ApplicantCapability)
  public capabilities: Capability[];

  public getCareers!: HasManyGetAssociationsMixin<Career>;

  public async addCapabilities(newCapabilities: Capability[], transaction?: Transaction) {
    this.capabilities = this.capabilities || [];
    for (const capability of newCapabilities) {
      await ApplicantCapability.create(
        { capabilityUuid: capability.uuid , applicantUuid: this.uuid},
        { transaction }
      );
      this.capabilities.push(capability);
    }
  }

  public async addCareers(
    newCareers: Career[], applicantCareers: IApplicantCareer[], transaction?: Transaction) {
    this.careers = this.careers || [];
    for (const career of newCareers) {
      const applicantCareer = find(applicantCareers, c => c.code === career.code);
      await CareerApplicant.create(
        {
          careerCode: career.code,
          applicantUuid: this.uuid,
          creditsCount: applicantCareer!.creditsCount
        },
        { transaction }
      );
      this.careers.push(career);
    }
  }
}
