import { Column, Is, Model, Table } from "sequelize-typescript";
import { ENUM, INTEGER, STRING, BOOLEAN } from "sequelize";
import { Secretary, SecretaryEnumValues } from "$models/Admin/Interface";
import { isSecretary } from "../SequelizeModelValidators";
import { validateIntegerInRange, validateEmail } from "validations-fiuba-laboral-v2";

@Table({ tableName: "SecretarySettings", timestamps: false })
export class SecretarySettings extends Model<SecretarySettings> {
  @Column({
    allowNull: false,
    primaryKey: true,
    type: ENUM<string>({ values: SecretaryEnumValues }),
    ...isSecretary
  })
  public secretary: Secretary;

  @Is("offerDurationInDays", validateIntegerInRange({ min: { value: 0, include: false } }))
  @Column({ type: INTEGER, allowNull: false })
  public offerDurationInDays: number;

  @Is("email", validateEmail)
  @Column({ type: STRING, allowNull: false })
  public email: string;

  @Column({ type: STRING, allowNull: false })
  public emailSignature: string;

  @Column({ type: BOOLEAN, allowNull: false })
  public automaticJobApplicationApproval: boolean;
}
