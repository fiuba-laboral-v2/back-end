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
  @Column({
    allowNull: false,
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4
  })
  public uuid: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  public photo: string;

  @ForeignKey(() => Company)
  @AllowNull(false)
  @Column(DataType.UUID)
  public companyUuid: string;

  @BelongsTo(() => Company)
  public company: Company;
}
