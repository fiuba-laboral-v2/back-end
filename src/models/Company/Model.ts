import {
  AllowNull,
  Column,
  DataType,
  HasMany,
  Model,
  Table,
  Is,
  BeforeCreate
} from "sequelize-typescript";
import { CompanyPhoneNumber } from "../CompanyPhoneNumber";
import { CompanyPhoto } from "../CompanyPhoto";
import { validateCuit, validateName } from "validations-fiuba-laboral-v2";

@Table
export default class Company extends Model<Company> {
  @BeforeCreate
  public static beforeCreateHook(company: Company): void {
    company.phoneNumbers = company.phoneNumbers || [];
    company.photos = company.photos || [];
  }

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

  @HasMany(() => CompanyPhoneNumber)
  public phoneNumbers: CompanyPhoneNumber[];

  @HasMany(() => CompanyPhoto)
  public photos: CompanyPhoto[];
}
