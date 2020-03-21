import {
  Column,
  DataType,
  BelongsToMany,
  Model,
  Table,
  Is,
    HasMany
} from "sequelize-typescript";
import { HasManyGetAssociationsMixin, HasManyHasAssociationMixin } from "sequelize";
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

  @HasMany(() => CareerApplicant)
  public careersApplicants: CareerApplicant[];

  @BelongsToMany(() => Career, () => CareerApplicant)
  public careers: Career[];

  @BelongsToMany(() => Capability, () => ApplicantCapability)
  public capabilities: Capability[];

  public getCareers!: HasManyGetAssociationsMixin<Career>;
  public getCapabilities!: HasManyGetAssociationsMixin<Capability>;
  public getCareersApplicants!: HasManyGetAssociationsMixin<CareerApplicant>;
  public hasCapability: HasManyHasAssociationMixin<Capability, "description">;
}
