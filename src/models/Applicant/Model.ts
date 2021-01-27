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
import { ENUM, HasManyGetAssociationsMixin, INTEGER, TEXT, UUID, UUIDV4 } from "sequelize";
import { validateIntegerInRange } from "validations-fiuba-laboral-v2";
import {
  ApplicantApprovalEvent,
  ApplicantCapability,
  ApplicantCareer,
  ApplicantExperienceSection,
  ApplicantKnowledgeSection,
  ApplicantLink,
  Capability,
  Career,
  JobApplication,
  Offer,
  UserSequelizeModel
} from "$models";
import { ApprovalStatus, approvalStatuses } from "$models/ApprovalStatus";
import { ApplicantType } from "$models/Applicant";
import { isApprovalStatus } from "$models/SequelizeModelValidators";
import { ApplicantWithNoCareersError } from "./Errors";
import { Nullable } from "$models/SequelizeModel";

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
  public description: Nullable<string>;

  @ForeignKey(() => UserSequelizeModel)
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

  @BelongsTo(() => UserSequelizeModel, "userUuid")
  public user: UserSequelizeModel;

  @HasMany(() => ApplicantKnowledgeSection)
  public knowledgeSections: ApplicantKnowledgeSection[];

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
  public getCapabilities: HasManyGetAssociationsMixin<Capability>;
  public getApplicantCareers: HasManyGetAssociationsMixin<ApplicantCareer>;
  public getKnowledgeSections: HasManyGetAssociationsMixin<ApplicantKnowledgeSection>;
  public getExperienceSections: HasManyGetAssociationsMixin<ApplicantExperienceSection>;
  public getLinks: HasManyGetAssociationsMixin<ApplicantLink>;
  public getJobApplications: HasManyGetAssociationsMixin<JobApplication>;

  public async getType() {
    const applicantCareers = await this.getApplicantCareers();
    const isGraduate = applicantCareers.some(applicantCareer => applicantCareer.isGraduate);
    const isStudent = applicantCareers.some(applicantCareer => !applicantCareer.isGraduate);
    if (isGraduate && isStudent) return ApplicantType.both;
    if (isGraduate) return ApplicantType.graduate;
    if (isStudent) return ApplicantType.student;
    throw new ApplicantWithNoCareersError(this.uuid);
  }

  public applyTo(offer: Offer) {
    return new JobApplication({ offerUuid: offer.uuid, applicantUuid: this.uuid });
  }

  public isRejected() {
    return this.approvalStatus === ApprovalStatus.rejected;
  }
}
