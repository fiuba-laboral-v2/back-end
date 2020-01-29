import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table
} from "sequelize-typescript";
import { CompanyProfile } from "../CompanyProfile";

@Table
export default class CompanyProfilePhoneNumber extends Model<CompanyProfilePhoneNumber> {
  @AllowNull(false)
  @Column(DataType.INTEGER)
  public phoneNumber: number;

  @ForeignKey(() => CompanyProfile)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  public companyProfileId: number;

  @BelongsTo(() => CompanyProfile)
  public companyProfile: CompanyProfile;
}
