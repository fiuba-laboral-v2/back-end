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
  HasManyGetAssociationsMixin,
  HasOneGetAssociationMixin,
  INTEGER,
  TEXT,
  UUID,
  UUIDV4
} from "sequelize";
import { validateIntegerInRange } from "validations-fiuba-laboral-v2";
import {
  ApplicantApprovalEvent,
  ApplicantCapability,
  ApplicantCareer,
  ApplicantLink,
  Capability,
  Career,
  JobApplication,
  ApplicantKnowledgeSection,
  ApplicantExperienceSection,
  User
} from "$models";
import { ApprovalStatus, approvalStatuses } from "$models/ApprovalStatus";
import { ApplicantType } from "$models/Applicant";
import { isApprovalStatus } from "$models/SequelizeModelValidators";
import { ApplicantWithNoCareersError } from "./Errors";

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
    ...isApprovalStatus
  })
  public approvalStatus: ApprovalStatus;

  @BelongsTo(() => User, "userUuid")
  public user: User;

  @HasMany(() => ApplicantKnowledgeSection)
  public sections: ApplicantKnowledgeSection[];

  @HasMany(() => ApplicantExperienceSection)
  public experienceSections: ApplicantExperienceSection[];

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

  @HasMany(() => ApplicantApprovalEvent)
  public approvalEvents: ApplicantApprovalEvent;

  public getCareers: HasManyGetAssociationsMixin<Career>;
  public getUser: HasOneGetAssociationMixin<User>;
  public getCapabilities: HasManyGetAssociationsMixin<Capability>;
  public getApplicantCareers: HasManyGetAssociationsMixin<ApplicantCareer>;
  public getSections: HasManyGetAssociationsMixin<ApplicantKnowledgeSection>;
  public getExperienceSections: HasManyGetAssociationsMixin<ApplicantExperienceSection>;
  public getLinks: HasManyGetAssociationsMixin<ApplicantLink>;
  public getJobApplications: HasManyGetAssociationsMixin<JobApplication>;
  public getApprovalEvents: HasManyGetAssociationsMixin<ApplicantApprovalEvent>;

  public async getType() {
    const applicantCareers = await this.getApplicantCareers();
    const isGraduate = applicantCareers.some(applicantCareer => applicantCareer.isGraduate);
    const isStudent = applicantCareers.some(applicantCareer => !applicantCareer.isGraduate);
    if (isGraduate && isStudent) return ApplicantType.both;
    if (isGraduate) return ApplicantType.graduate;
    if (isStudent) return ApplicantType.student;
    throw new ApplicantWithNoCareersError(this.uuid);
  }
}
