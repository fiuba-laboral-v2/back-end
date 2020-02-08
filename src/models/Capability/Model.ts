import { Column, DataType, Model, Table, BelongsToMany } from "sequelize-typescript";
import { Applicant } from "../Applicant/Model";
import { ApplicantCapability } from "../ApplicantCapability/Model";

@Table({
  defaultScope: {
    attributes: { exclude: [ "deletedAt" ] }
  },
  tableName: "Capabilities"
})
export class Capability extends Model<Capability> {
  @Column({
    allowNull: false,
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4
  })
  public uuid: string;

  @Column({
    allowNull: false,
    type: DataType.STRING
  })
  public description: string;

  @BelongsToMany(() => Applicant, () => ApplicantCapability)
  public applicants: Applicant[];
}
