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
  BOOLEAN,
  DATE,
  ENUM,
  HasManyGetAssociationsMixin,
  HasOneGetAssociationMixin,
  INTEGER,
  TEXT,
  UUID,
  UUIDV4
} from "sequelize";
import { Admin, Career, Company, OfferApprovalEvent, OfferCareer, OfferSection } from "$models";
import { Secretary } from "$models/Admin";
import { validateIntegerInRange, validateSalaryRange } from "validations-fiuba-laboral-v2";
import { ApprovalStatus, approvalStatuses } from "$models/ApprovalStatus";
import { isApprovalStatus, isTargetApplicantType } from "$models/SequelizeModelValidators";
import { ApplicantType, targetApplicantTypeEnumValues } from "$models/Applicant";
import { isNil } from "lodash";
import { DateTimeManager } from "$libs/DateTimeManager";
import { InternshipsCannotHaveMaximumSalaryError } from "./Errors/InternshipsCannotHaveMaximumSalaryError";
import { InternshipsMustTargetStudentsError } from "./Errors/InternshipsMustTargetStudentsError";

@Table({
  tableName: "Offers",
  validate: {
    validateSalaryRange(this: Offer) {
      if (isNil(this.maximumSalary)) return;
      validateSalaryRange(this.minimumSalary, this.maximumSalary);
    },
    validateInternship(this: Offer) {
      if (!this.isInternship) return;
      if (this.maximumSalary !== null) throw new InternshipsCannotHaveMaximumSalaryError();
      if (this.targetApplicantType !== ApplicantType.student) {
        throw new InternshipsMustTargetStudentsError();
      }
    }
  }
})
export class Offer extends Model<Offer> {
  @Column({ allowNull: false, primaryKey: true, type: UUID, defaultValue: UUIDV4 })
  public uuid: string;

  @ForeignKey(() => Company)
  @Column({ allowNull: false, type: UUID })
  public companyUuid: string;

  @BelongsTo(() => Company)
  public company: Company;

  @Column({ allowNull: false, type: TEXT })
  public title: string;

  @Column({ allowNull: false, type: TEXT })
  public description: string;

  @Column({
    allowNull: false,
    type: ENUM<string>({ values: approvalStatuses }),
    defaultValue: ApprovalStatus.pending,
    ...isApprovalStatus
  })
  public extensionApprovalStatus: ApprovalStatus;

  @Column({
    allowNull: false,
    type: ENUM<string>({ values: approvalStatuses }),
    defaultValue: ApprovalStatus.pending,
    ...isApprovalStatus
  })
  public graduadosApprovalStatus: ApprovalStatus;

  @Column({
    allowNull: false,
    type: ENUM<string>({ values: targetApplicantTypeEnumValues }),
    ...isTargetApplicantType
  })
  public targetApplicantType: ApplicantType;

  @Is("hoursPerDay", validateIntegerInRange({ min: { value: 0, include: false } }))
  @Column({ allowNull: false, type: INTEGER })
  public hoursPerDay: number;

  @Column({ allowNull: false, type: BOOLEAN })
  public isInternship: boolean;

  @Is("minimumSalary", validateIntegerInRange({ min: { value: 0, include: false } }))
  @Column({ allowNull: false, type: INTEGER })
  public minimumSalary: number;

  @Is("maximumSalary", salary => {
    if (!salary) return;
    validateIntegerInRange({ min: { value: 0, include: false } })(salary);
  })
  @Column({ allowNull: true, type: INTEGER })
  public maximumSalary?: number;

  @Column({ allowNull: true, type: DATE })
  public graduatesExpirationDateTime: Date;

  @Column({ allowNull: true, type: DATE })
  public studentsExpirationDateTime: Date;

  @HasMany(() => OfferSection)
  public sections: OfferSection[];

  @BelongsToMany(() => Career, () => OfferCareer)
  public careers: Career[];

  @HasMany(() => OfferCareer)
  public offerCareers: OfferCareer[];

  @HasMany(() => OfferApprovalEvent)
  public approvalEvents: OfferApprovalEvent;

  public getCompany: HasOneGetAssociationMixin<Company>;
  public getSections: HasManyGetAssociationsMixin<OfferSection>;
  public getCareers: HasManyGetAssociationsMixin<Career>;

  public expire() {
    if (this.isTargetedForGraduates()) this.expireForGraduates();
    if (this.isTargetedForStudents()) this.expireForStudents();
  }

  public updateExpirationDate(admin: Admin, offerDurationInDays: number) {
    const isApproved = chooseStatus => chooseStatus === ApprovalStatus.approved;
    const status = this.getStatus(admin.secretary);
    const expirationDate = DateTimeManager.daysFromNow(offerDurationInDays);
    if (admin.isFromGraduadosSecretary()) {
      if (isApproved(status)) {
        this.graduatesExpirationDateTime = expirationDate.toDate();
      } else {
        this.graduatesExpirationDateTime = null as any;
      }
    }
    if (admin.isFromExtensionSecretary()) {
      if (isApproved(status)) {
        this.studentsExpirationDateTime = expirationDate.toDate();
      } else {
        this.studentsExpirationDateTime = null as any;
      }
    }
  }

  public isExpiredForStudents = () => {
    const status = this.getStatus(Secretary.extension);
    if (status === ApprovalStatus.rejected) return false;
    if (status === ApprovalStatus.pending) return false;

    return this.studentsExpirationDateTime < new Date();
  };

  public isExpiredForGraduates = () => {
    const status = this.getStatus(Secretary.graduados);
    if (status === ApprovalStatus.rejected) return false;
    if (status === ApprovalStatus.pending) return false;

    return this.graduatesExpirationDateTime < new Date();
  };

  public getStatus(secretary: Secretary) {
    if (secretary === Secretary.extension) return this.extensionApprovalStatus;
    return this.graduadosApprovalStatus;
  }

  public updateStatus(admin: Admin, newStatus: ApprovalStatus) {
    if (admin.isFromExtensionSecretary()) return this.updateExtensionApprovalStatus(newStatus);
    if (admin.isFromGraduadosSecretary()) return this.updateGraduadosApprovalStatus(newStatus);
  }

  private expireForStudents = () => {
    this.studentsExpirationDateTime = DateTimeManager.yesterday();
  };

  private expireForGraduates = () => {
    this.graduatesExpirationDateTime = DateTimeManager.yesterday();
  };

  private updateExtensionApprovalStatus(newStatus: ApprovalStatus) {
    this.extensionApprovalStatus = newStatus;
  }

  private updateGraduadosApprovalStatus(newStatus: ApprovalStatus) {
    this.graduadosApprovalStatus = newStatus;
  }

  private isTargetedForStudents = () => {
    return (
      this.targetApplicantType === ApplicantType.student ||
      this.targetApplicantType === ApplicantType.both
    );
  };

  private isTargetedForGraduates = () => {
    return (
      this.targetApplicantType === ApplicantType.graduate ||
      this.targetApplicantType === ApplicantType.both
    );
  };
}
