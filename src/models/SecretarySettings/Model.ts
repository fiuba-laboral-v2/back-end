import { Column, Model, Table } from "sequelize-typescript";
import { ENUM, INTEGER } from "sequelize";
import { Secretary, SecretaryEnumValues } from "$models/Admin/Interface";
import { isSecretary, And, isGraterThanZero, isInteger } from "../SequelizeModelValidators";

@Table({ tableName: "SecretarySettings", timestamps: false })
export class SecretarySettings extends Model<SecretarySettings> {
  @Column({
    allowNull: false,
    primaryKey: true,
    type: ENUM<string>({ values: SecretaryEnumValues }),
    ...isSecretary
  })
  public secretary: Secretary;

  @Column({
    type: INTEGER,
    allowNull: false,
    ...And(isGraterThanZero, isInteger)
  })
  public offerDurationInDays: number;
}
