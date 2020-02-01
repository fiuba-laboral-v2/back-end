import { AllowNull, Column, DataType, HasMany, Model, Table } from "sequelize-typescript";
import { CompanyProfilePhoneNumber } from "../CompanyProfilePhoneNumber";
import { CompanyProfilePhoto } from "../CompanyProfilePhoto";

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

  @HasMany(() => CompanyProfilePhoneNumber)
  public phoneNumbers: CompanyProfilePhoneNumber[];

  @HasMany(() => CompanyProfilePhoto)
  public photos: CompanyProfilePhoto[];

  public serialize() {
    return {
      id: this.id,
      cuit: this.cuit,
      companyName: this.companyName,
      slogan: this.slogan,
      description: this.description,
      logo: this.logo,
      phoneNumbers: this.phoneNumbers?.map(phoneNumber => {
        return phoneNumber.phoneNumber;
      }),
      photos: this.photos?.map(photo => {
        return photo.photo;
      })
    };
  }
}
