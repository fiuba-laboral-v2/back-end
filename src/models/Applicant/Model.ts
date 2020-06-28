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
  ENUM,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasOneGetAssociationMixin,
  INTEGER,
  TEXT,
  UUID,
  UUIDV4
} from "sequelize";
import { validateIntegerInRange } from "validations-fiuba-laboral-v2";
import { JobApplication } from "../JobApplication";
import { Career } from "../Career/Model";
import { ApplicantCareer } from "../ApplicantCareer/Model";
import { Capability } from "../Capability/Model";
import { ApplicantCapability } from "../ApplicantCapability/Model";
import { Section } from "./Section";
import { ApplicantLink } from "./Link";
import { User } from "../User";
import { ApprovalStatus, approvalStatuses } from "../ApprovalStatus";

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

  @Column({
    allowNull: false,
    type: ENUM<string>({ values: approvalStatuses }),
    defaultValue: ApprovalStatus.pending,
    validate: {
      isIn: {
        msg: `ApprovalStatus must be one of these values: ${approvalStatuses}`,
        args: [approvalStatuses]
      }
    }
  })
  public approvalStatus: ApprovalStatus;

  @BelongsTo(() => User, "userUuid")
  public user: User;

  @HasMany(() => Section)
  public sections: Section[];

  @HasMany(() => ApplicantLink)
  public links: ApplicantLink[];

  @HasMany(() => JobApplication)
  public jobApplications: JobApplication[];

  @HasMany(() => ApplicantCareer)
  public applicantCareers: ApplicantCareer[];

  @BelongsToMany(() => Career, () => ApplicantCareer)
  public careers: Career[];

  @BelongsToMany(() => Capability, () => ApplicantCapability)
  public capabilities: Capability[];

  public getCareers: HasManyGetAssociationsMixin<Career>;
  public getUser: HasOneGetAssociationMixin<User>;

  public getCapabilities: HasManyGetAssociationsMixin<Capability>;
  public getApplicantCareers: HasManyGetAssociationsMixin<ApplicantCareer>;

  public getSections: HasManyGetAssociationsMixin<Section>;
  public createSection: HasManyCreateAssociationMixin<Section>;

  public getLinks: HasManyGetAssociationsMixin<ApplicantLink>;

  public getJobApplications: HasManyGetAssociationsMixin<JobApplication>;
}
