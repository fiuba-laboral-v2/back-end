import {
  AllowNull,
  Column,
  DataType,
  HasMany,
  Model,
  Table,
  Is
} from "sequelize-typescript";
import { CompanyPhoneNumber } from "../CompanyPhoneNumber";
import { CompanyPhoto } from "../CompanyPhoto";
import { Offer } from "../Offer/Model";
import { validateCuit, validateName } from "validations-fiuba-laboral-v2";
import { HasManyGetAssociationsMixin } from "sequelize";

@Table
export class Company extends Model<Company> {
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

  @HasMany(() => Offer)
  public offers: Offer[];

  public getPhoneNumbers!: HasManyGetAssociationsMixin<CompanyPhoneNumber>;
  public getPhotos!: HasManyGetAssociationsMixin<CompanyPhoto>;
  public getOffers!: HasManyGetAssociationsMixin<Offer>;
}
