import { AllowNull, Column, DataType, HasMany, Model, Table, Is } from "sequelize-typescript";
import { CompanyProfilePhoneNumber } from "../CompanyProfilePhoneNumber";
import { CompanyProfilePhoto } from "../CompanyProfilePhoto";
import { validateCuit, validateName } from "validations-fiuba-laboral-v2";

@Table
export default class Company extends Model<Company> {
  @AllowNull(false)
  @Is("cuit", validateCuit)
  @Column(DataType.STRING)
  public cuit: string;

  @AllowNull(false)
  @Is("name", validateName)
  @Column(DataType.STRING)
  public companyName: string;

  @Column(DataType.STRING)
  public slogan: string;

  @Column(DataType.STRING)
  public description: string;

  @Column(DataType.TEXT)
  public logo: string;

  @Column(DataType.STRING)
  public website: string;

  @Column(DataType.STRING)
  public email: string;

  @HasMany(() => CompanyProfilePhoneNumber)
  public phoneNumbers: CompanyProfilePhoneNumber[];

  @HasMany(() => CompanyProfilePhoto)
  public photos: CompanyProfilePhoto[];
}
