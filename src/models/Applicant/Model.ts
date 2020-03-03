import { Column, DataType, BelongsToMany, Model, Table, Is } from "sequelize-typescript";
import {
  HasManyGetAssociationsMixin,
  HasManyAddAssociationMixin,
  HasManyHasAssociationMixin,
  HasManyCountAssociationsMixin,
  HasManySetAssociationsMixin,
  HasManyCreateAssociationMixin,
} from "sequelize";
import { validateName } from "validations-fiuba-laboral-v2";
import { Career } from "../Career/Model";
import { CareerApplicant } from "../CareerApplicant/Model";
import { Capability } from "../Capability/Model";
import { ApplicantCapability } from "../ApplicantCapability/Model";


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
  public addCareer!: HasManyAddAssociationMixin<Career,string>;
  public hasCareers!: HasManyHasAssociationMixin<Career, string>;
  public setCareers!: HasManySetAssociationsMixin<Career[], string>;
  public countCareers!: HasManyCountAssociationsMixin;
  public createCareer!: HasManyCreateAssociationMixin<Career>;

  public addCapabilities(newCapabilities: Capability[] = []) {
    if (this.capabilities) {
      for (const capability of newCapabilities) {
        this.capabilities.push(capability);
      }
    } else {
      this.capabilities = newCapabilities;
    }
  }

  public addCareers(newCareers: Career[] = []) {
    if (this.careers) {
      for (const career of newCareers) {
        this.careers.push(career);
      }
    } else {
      this.careers = newCareers;
    }
  }
}
