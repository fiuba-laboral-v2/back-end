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
export default class CompanyProfilePhoneNumber extends Model<CompanyProfilePhoneNumber> {
  @AllowNull(false)
  @Column(DataType.INTEGER)
  public phoneNumber: number;

  @ForeignKey(() => Company)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  public companyProfileId: number;

  @BelongsTo(() => Company)
  public companyProfile: Company;
}
