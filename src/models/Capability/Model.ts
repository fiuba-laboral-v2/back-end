import { BelongsToMany, Column, Model, Table } from "sequelize-typescript";
import { Applicant, ApplicantCapability } from "..";
import { CITEXT, UUID, UUIDV4 } from "sequelize";

@Table({ tableName: "Capabilities" })
export class Capability extends Model<Capability> {
  @Column({
    allowNull: false,
    primaryKey: true,
    type: UUID,
    defaultValue: UUIDV4
  })
  public uuid: string;

  @Column({
    allowNull: false,
    unique: true,
    type: CITEXT
  })
  public description: string;

  @BelongsToMany(() => Applicant, () => ApplicantCapability)
  public applicants: Applicant[];
}
