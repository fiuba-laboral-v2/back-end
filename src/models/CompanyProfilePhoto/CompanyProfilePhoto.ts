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
export default class CompanyProfilePhoto extends Model<CompanyProfilePhoto> {
  @AllowNull(false)
  @Column(DataType.TEXT)
  public photo: string;

  @ForeignKey(() => Company)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  public companyProfileId: number;

  @BelongsTo(() => Company)
  public companyProfile: Company;
}
