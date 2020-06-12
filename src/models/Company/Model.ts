import { AllowNull, Column, HasMany, Is, Model, Table, BelongsToMany } from "sequelize-typescript";
import { HasManyGetAssociationsMixin, STRING, TEXT, UUID, UUIDV4, ENUM } from "sequelize";
import { CompanyPhoneNumber } from "../CompanyPhoneNumber";
import { CompanyPhoto } from "../CompanyPhoto";
import { Offer } from "../Offer/Model";
import { User } from "../User/Model";
import { CompanyUser } from "../CompanyUser/Model";
import { CompanyApprovalEvent } from "./CompanyApprovalEvent/Model";
import { ApprovalStatus, approvalStatuses } from "../ApprovalStatus";
import {
  validateCuit,
  validateName,
  validateURL,
  validateEmail
} from "validations-fiuba-laboral-v2";

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

  @Is(validateURL)
  @Column(STRING)
  public website: string;

  @Is(validateEmail)
  @Column(STRING)
  public email: string;

  @Column({
    allowNull: false,
    type: ENUM<string>({ values: approvalStatuses }),
    defaultValue: ApprovalStatus.pending
  })
  public approvalStatus: ApprovalStatus;

  @HasMany(() => CompanyPhoneNumber)
  public phoneNumbers: CompanyPhoneNumber[];

  @HasMany(() => CompanyPhoto)
  public photos: CompanyPhoto[];

  @HasMany(() => Offer)
  public offers: Offer[];

  @BelongsToMany(() => User, () => CompanyUser)
  public users: User[];

  @HasMany(() => CompanyApprovalEvent)
  public approvalEvents: CompanyApprovalEvent;

  public getPhoneNumbers: HasManyGetAssociationsMixin<CompanyPhoneNumber>;
  public getPhotos: HasManyGetAssociationsMixin<CompanyPhoto>;
  public getOffers: HasManyGetAssociationsMixin<Offer>;
  public getUsers: HasManyGetAssociationsMixin<User>;
  public getApprovalEvents: HasManyGetAssociationsMixin<CompanyApprovalEvent>;
}
