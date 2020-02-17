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
export default class CompanyPhoto extends Model<CompanyPhoto> {
  @AllowNull(false)
  @Column(DataType.TEXT)
  public photo: string;

  @ForeignKey(() => Company)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  public companyId: number;

  @BelongsTo(() => Company)
  public company: Company;
}
