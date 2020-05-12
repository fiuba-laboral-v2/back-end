import { AllowNull, Column, HasMany, Is, Model, Table } from "sequelize-typescript";
import { CompanyPhoneNumber } from "../CompanyPhoneNumber";
import { CompanyPhoto } from "../CompanyPhoto";
import { Offer } from "../Offer/Model";
import { validateCuit, validateName } from "validations-fiuba-laboral-v2";
import { HasManyGetAssociationsMixin, STRING, TEXT, UUID, UUIDV4 } from "sequelize";

@Table
export class Company extends Model<Company> {
  @Column({
    allowNull: false,
    primaryKey: true,
    type: UUID,
    defaultValue: UUIDV4
  })
  public uuid: string;

  @AllowNull(false)
  @Is("cuit", validateCuit)
  @Column(STRING)
  public cuit: string;

  @AllowNull(false)
  @Is("name", validateName)
  @Column(STRING)
  public companyName: string;

  @Column(STRING)
  public slogan: string;

  @Column(TEXT)
  public description: string;

  @Column(TEXT)
  public logo: string;

  // @Is(validateURL)
  @Column(STRING)
  public website: string;

  @Column(STRING)
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
