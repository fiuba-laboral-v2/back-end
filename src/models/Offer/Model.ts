import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Is,
  Model,
  Table
} from "sequelize-typescript";
import { HasManyGetAssociationsMixin, HasOneGetAssociationMixin } from "sequelize";
import { Company } from "../Company";
import { OfferSection } from "./OfferSection";
import { OfferCareer } from "./OfferCareer";
import { Career } from "../Career/Model";
import { validateIntegerInRange, validateSalaryRange } from "validations-fiuba-laboral-v2";

@Table({
  tableName: "Offers",
  validate: {
    validateSalaryRange(this: Offer) {
      validateSalaryRange(this.minimumSalary, this.maximumSalary);
    }
  }
})
export class Offer extends Model<Offer> {
  @Column({
    allowNull: false,
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4
  })
  public uuid: string;

  @ForeignKey(() => Company)
  @Column({
    allowNull: false,
    type: DataType.INTEGER
  })
  public companyId: number;

  @BelongsTo(() => Company)
  public company: Company;

  @Column({
    allowNull: false,
    type: DataType.TEXT
  })
  public title: string;

  @Column({
    allowNull: false,
    type: DataType.TEXT
  })
  public description: string;

  @Is("hoursPerDay", validateIntegerInRange({ min: { value: 0, include: false } }))
  @Column({
    allowNull: false,
    type: DataType.INTEGER
  })
  public hoursPerDay: number;

  @Is("minimumSalary", validateIntegerInRange({ min: { value: 0, include: false } }))
  @Column({
    allowNull: false,
    type: DataType.INTEGER
  })
  public minimumSalary: number;

  @Is("maximumSalary", validateIntegerInRange({ min: { value: 0, include: false } }))
  @Column({
    allowNull: false,
    type: DataType.INTEGER
  })
  public maximumSalary: number;

  @HasMany(() => OfferSection)
  public sections: OfferSection[];

  @BelongsToMany(() => Career, () => OfferCareer)
  public careers: Career[];

  public getCompany: HasOneGetAssociationMixin<Company>;
  public getSections: HasManyGetAssociationsMixin<OfferSection>;
  public getCareers: HasManyGetAssociationsMixin<Career>;
}
