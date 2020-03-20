import {
  Column,
  DataType,
  BelongsToMany,
  Model,
  Table,
  Is,
  BeforeCreate
} from "sequelize-typescript";
import { HasManyGetAssociationsMixin } from "sequelize";
import { validateName } from "validations-fiuba-laboral-v2";
import { Career } from "../Career/Model";
import { CareerApplicant } from "../CareerApplicant/Model";
import { Capability } from "../Capability/Model";
import { ApplicantCapability } from "../ApplicantCapability/Model";
import { ICapability } from "../Capability";


@Table({
  tableName: "Applicants"
 })
export class Applicant extends Model<Applicant> {
  @BeforeCreate
  public static beforeCreateHook(applicant: Applicant): void {
    applicant.capabilities = applicant.capabilities || [];
    applicant.careers = applicant.careers || [];
  }

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

  public hasCapability(capability: ICapability) {
    return this.capabilities
      .map(({ description }: ICapability) => description)
      .includes(capability.description);
  }
}
