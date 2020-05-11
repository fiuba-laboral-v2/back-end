import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
  Is
} from "sequelize-typescript";
import { validatePhoneNumber } from "validations-fiuba-laboral-v2";
import { Company } from "../Company";

@Table
export default class CompanyPhoneNumber extends Model<CompanyPhoneNumber> {
  @Is(validatePhoneNumber)
  @Column({
    primaryKey: true,
    allowNull: false,
    type: DataType.STRING
  })
  public phoneNumber: number;

  @ForeignKey(() => Company)
  @Column({
    primaryKey: true,
    allowNull: false,
    type: DataType.UUID
  })
  public companyUuid: string;

  @BelongsTo(() => Company)
  public company: Company;
}
