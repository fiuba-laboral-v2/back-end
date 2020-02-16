import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table
} from "sequelize-typescript";
import { Company } from "../Company";

@Table
export default class CompanyPhoneNumber extends Model<CompanyPhoneNumber> {
  @AllowNull(false)
  @Column(DataType.INTEGER)
  public phoneNumber: number;

  @ForeignKey(() => Company)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  public companyId: number;

  @BelongsTo(() => Company)
  public company: Company;
}
