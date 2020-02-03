import { AllowNull, Column, DataType, HasMany, Model, Table } from "sequelize-typescript";
import { CompanyProfilePhoneNumber } from "../CompanyProfilePhoneNumber";
import { CompanyProfilePhoto } from "../CompanyProfilePhoto";
// import { validateCuit } from "validations";

@Table
export default class CompanyProfile extends Model<CompanyProfile> {
  @AllowNull(false)
  // @Is("cuit", validateCuit)
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

  @HasMany(() => CompanyProfilePhoneNumber)
  public phoneNumbers: CompanyProfilePhoneNumber[];

  @HasMany(() => CompanyProfilePhoto)
  public photos: CompanyProfilePhoto[];
}
