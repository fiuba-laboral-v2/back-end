import { AllowNull, Column, DataType, HasMany, Model, Table, Is } from "sequelize-typescript";
import { CompanyProfilePhoneNumber } from "../CompanyProfilePhoneNumber";
import { CompanyProfilePhoto } from "../CompanyProfilePhoto";
import { validateCuit, validateName } from "validations-fiuba-laboral-v2";

@Table
export default class CompanyProfile extends Model<CompanyProfile> {
  @AllowNull(false)
  @Is("cuit", validateCuit)
  @Column(DataType.TEXT)
  public cuit: string;

  @AllowNull(false)
  @Is("name", validateName)
  @Column(DataType.TEXT)
  public companyName: string;

  @Column(DataType.TEXT)
  public slogan: string;

  @Column(DataType.TEXT)
  public description: string;

  @Column(DataType.TEXT)
  public logo: string;

  @Column(DataType.TEXT)
  public website: string;

  @Column(DataType.TEXT)
  public email: string;

  @HasMany(() => CompanyProfilePhoneNumber)
  public phoneNumbers: CompanyProfilePhoneNumber[];

  @HasMany(() => CompanyProfilePhoto)
  public photos: CompanyProfilePhoto[];
}
