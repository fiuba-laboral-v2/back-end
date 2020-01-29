import { AllowNull, Column, DataType, Model, Table } from "sequelize-typescript";

@Table
export default class CompanyProfile extends Model<CompanyProfile> {
  @AllowNull(false)
  @Column(DataType.TEXT)
  public cuit: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  public companyName: string;

  @Column(DataType.TEXT)
  public slogan: string;

  @Column(DataType.TEXT)
  public description: string;

  @Column(DataType.TEXT)
  public logo: string;
}
