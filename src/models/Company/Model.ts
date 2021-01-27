import {
  BelongsToMany,
  Column,
  CreatedAt,
  HasMany,
  Is,
  Model,
  Table,
  UpdatedAt
} from "sequelize-typescript";
import { ENUM, HasManyGetAssociationsMixin, STRING, TEXT, UUID, UUIDV4, BOOLEAN } from "sequelize";
import { CompanyPhoneNumber, CompanyPhoto, CompanyUser, Offer, UserSequelizeModel } from "..";
import { CompanyApprovalEvent } from "./CompanyApprovalEvent/Model";
import { ApprovalStatus, approvalStatuses } from "../ApprovalStatus";
import {
  validateCuit,
  validateEmail,
  validateName,
  validateURL
} from "validations-fiuba-laboral-v2";
import { isNotEmptyString } from "../SequelizeModelValidators";

@Table({ tableName: "Companies", timestamps: true })
export class Company extends Model<Company> {
  @Column({ allowNull: false, primaryKey: true, type: UUID, defaultValue: UUIDV4 })
  public uuid: string;

  @Is("cuit", validateCuit)
  @Column({ allowNull: false, type: STRING })
  public cuit: string;

  @Is("name", validateName)
  @Column({ allowNull: false, type: STRING })
  public companyName: string;

  @Column({ allowNull: false, type: STRING, ...isNotEmptyString })
  public businessName: string;

  @Column({ allowNull: false, type: STRING, ...isNotEmptyString })
  public businessSector: string;

  @Column({ allowNull: false, type: BOOLEAN })
  public hasAnInternshipAgreement: boolean;

  @Column(STRING)
  public slogan: string;

  @Column(TEXT)
  public description: string;

  @Column(TEXT)
  public logo: string;

  @Is(validateURL)
  @Column(TEXT)
  public website: string;

  @Is(validateEmail)
  @Column(STRING)
  public email: string;

  @CreatedAt
  @Column
  public createdAt: Date;

  @UpdatedAt
  @Column
  public updatedAt: Date;

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

  @BelongsToMany(() => UserSequelizeModel, () => CompanyUser)
  public users: UserSequelizeModel[];

  @HasMany(() => CompanyApprovalEvent)
  public approvalEvents: CompanyApprovalEvent;

  public getPhoneNumbers: HasManyGetAssociationsMixin<CompanyPhoneNumber>;
  public getPhotos: HasManyGetAssociationsMixin<CompanyPhoto>;
  public getOffers: HasManyGetAssociationsMixin<Offer>;
  public getUsers: HasManyGetAssociationsMixin<UserSequelizeModel>;
}
