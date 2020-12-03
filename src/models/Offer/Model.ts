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
  HasManyGetAssociationsMixin,
  HasOneGetAssociationMixin,
  INTEGER,
  TEXT,
  UUID,
  UUIDV4,
  ENUM,
  BOOLEAN
} from "sequelize";
import { Career, Company, OfferCareer, OfferSection, OfferApprovalEvent } from "$models";
import { validateIntegerInRange, validateSalaryRange } from "validations-fiuba-laboral-v2";
import { approvalStatuses, ApprovalStatus } from "$models/ApprovalStatus";
import { isApprovalStatus, isTargetApplicantType } from "$models/SequelizeModelValidators";
import { ApplicantType, targetApplicantTypeEnumValues } from "$models/Applicant";
import { DATE } from "sequelize";
import { isNil } from "lodash";
import moment from "moment";

@Table({
  tableName: "Offers",
  validate: {
    validateSalaryRange(this: Offer) {
      if (isNil(this.maximumSalary)) return;
      validateSalaryRange(this.minimumSalary, this.maximumSalary);
    }
  }
})
export class Offer extends Model<Offer> {
  @Column({
    allowNull: false,
    primaryKey: true,
    type: UUID,
    defaultValue: UUIDV4
  })
  public uuid: string;

  @ForeignKey(() => Company)
  @Column({
    allowNull: false,
    type: UUID
  })
  public companyUuid: string;

  @BelongsTo(() => Company)
  public company: Company;

  @Column({
    allowNull: false,
    type: TEXT
  })
  public title: string;

  @Column({
    allowNull: false,
    type: TEXT
  })
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
  @Column({
    allowNull: false,
    type: INTEGER
  })
  public hoursPerDay: number;

  @Column({
    allowNull: false,
    type: BOOLEAN
  })
  public isInternship: boolean;

  @Is("minimumSalary", validateIntegerInRange({ min: { value: 0, include: false } }))
  @Column({
    allowNull: false,
    type: INTEGER
  })
  public minimumSalary: number;

  @Is("maximumSalary", salary => {
    if (!salary) return;
    validateIntegerInRange({ min: { value: 0, include: false } })(salary);
  })
  @Column({
    allowNull: true,
    type: INTEGER
  })
  public maximumSalary?: number;

  @Column({
    allowNull: true,
    type: DATE
  })
  public graduatesExpirationDateTime: Date;

  @Column({
    allowNull: true,
    type: DATE
  })
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
  public getApprovalEvents: HasManyGetAssociationsMixin<OfferApprovalEvent>;

  public expireForStudents = () => {
    this.studentsExpirationDateTime = moment().startOf("day").subtract(1, "day").toDate();
  };

  public expireForGraduates = () => {
    this.graduatesExpirationDateTime = moment().startOf("day").subtract(1, "day").toDate();
  };

  public expire() {
    if (this.targetApplicantType === ApplicantType.graduate) this.expireForGraduates();
    if (this.targetApplicantType === ApplicantType.student) this.expireForStudents();
    if (this.targetApplicantType === ApplicantType.both) {
      this.expireForGraduates();
      this.expireForStudents();
    }
    return this;
  }

  public isExpiredForStudents = () => {
    return this.studentsExpirationDateTime < new Date();
  };

  public isExpiredForGraduates = () => {
    return this.graduatesExpirationDateTime < new Date();
  };
}
