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
export default class CompanyProfilePhoto extends Model<CompanyProfilePhoto> {
  @AllowNull(false)
  @Column(DataType.STRING)
  public photo: string;

  @ForeignKey(() => CompanyProfile)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  public companyProfileId: number;

  @BelongsTo(() => CompanyProfile)
  public companyProfile: CompanyProfile;
}
