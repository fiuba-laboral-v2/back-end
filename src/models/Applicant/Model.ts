import {
  BelongsTo,
  BelongsToMany,
  Column,
  ForeignKey,
  HasMany,
  Is,
  Model,
  Table
} from "sequelize-typescript";
import {
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyHasAssociationMixin,
  HasOneGetAssociationMixin,
  INTEGER,
  TEXT,
  UUID,
  UUIDV4
} from "sequelize";
import { validateIntegerInRange } from "validations-fiuba-laboral-v2";
import { JobApplication } from "../JobApplication";
import { Career } from "../Career/Model";
import { CareerApplicant } from "../CareerApplicant/Model";
import { Capability } from "../Capability/Model";
import { ApplicantCapability } from "../ApplicantCapability/Model";
import { Section } from "./Section";
import { ApplicantLink } from "./Link";
import { User } from "../User";

@Table({ tableName: "Applicants" })
export class Applicant extends Model<Applicant> {
  @Column({
    allowNull: false,
    primaryKey: true,
    type: UUID,
    defaultValue: UUIDV4
  })
  public uuid: string;

  @Is("padron", validateIntegerInRange({ min: { value: 0, include: false } }))
  @Column({
    allowNull: false,
    type: INTEGER
  })
  public padron: number;

  @Column({
    allowNull: true,
    type: TEXT
  })
  public description: string;

  @ForeignKey(() => User)
  @Column({
    allowNull: false,
    type: UUID
  })
  public userUuid: string;

  @BelongsTo(() => User, "userUuid")
  public user: User;

  @HasMany(() => Section)
  public sections: Section[];

  @HasMany(() => ApplicantLink)
  public links: ApplicantLink[];

  @HasMany(() => JobApplication)
  public jobApplications: JobApplication[];

  @HasMany(() => CareerApplicant)
  public careersApplicants: CareerApplicant[];

  @BelongsToMany(() => Career, () => CareerApplicant)
  public careers: Career[];

  @BelongsToMany(() => Capability, () => ApplicantCapability)
  public capabilities: Capability[];

  public getCareers: HasManyGetAssociationsMixin<Career>;
  public hasCareer: HasManyHasAssociationMixin<Career, string>;
  public getUser: HasOneGetAssociationMixin<User>;

  public getCapabilities: HasManyGetAssociationsMixin<Capability>;
  public getCareersApplicants: HasManyGetAssociationsMixin<CareerApplicant>;
  public hasCapability: HasManyHasAssociationMixin<Capability, "description">;

  public getSections: HasManyGetAssociationsMixin<Section>;
  public hasSection: HasManyHasAssociationMixin<Section, string>;
  public createSection: HasManyCreateAssociationMixin<Section>;

  public getLinks: HasManyGetAssociationsMixin<ApplicantLink>;
  public hasLink: HasManyHasAssociationMixin<ApplicantLink, string>;
  public createLink: HasManyCreateAssociationMixin<ApplicantLink>;

  public getJobApplications: HasManyGetAssociationsMixin<JobApplication>;
}
