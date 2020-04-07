import {
  Column,
  DataType,
  Model,
  Table,
  ForeignKey,
  BelongsTo,
  Is,
  HasMany
} from "sequelize-typescript";
import { HasOneGetAssociationMixin, HasManyGetAssociationsMixin } from "sequelize";
import { Company } from "../Company";
import { OfferSection } from "./OfferSection";
import { validateIntegerGreaterThan, validateSalaryRange } from "validations-fiuba-laboral-v2";

@Table({
  tableName: "Offers",
  validate: {
    validateSalaryRange(this: Offer) {
      validateSalaryRange(this.minimumSalary, this.maximumSalary);
    }
  }
})
export default class Offer extends Model<Offer> {
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

  @Is("hoursPerDay", (hoursPerDay: number) => validateIntegerGreaterThan(hoursPerDay, 0))
  @Column({
    allowNull: false,
    type: DataType.INTEGER
  })
  public hoursPerDay: number;

  @Is("minimumSalary", (minimumSalary: number) => validateIntegerGreaterThan(minimumSalary, 0))
  @Column({
    allowNull: false,
    type: DataType.INTEGER
  })
  public minimumSalary: number;

  @Is("maximumSalary", (maximumSalary: number) => validateIntegerGreaterThan(maximumSalary, 0))
  @Column({
    allowNull: false,
    type: DataType.INTEGER
  })
  public maximumSalary: number;

  @HasMany(() => OfferSection)
  public sections: OfferSection[];

  public getCompany: HasOneGetAssociationMixin<Company>;
  public getSections: HasManyGetAssociationsMixin<OfferSection>;
}
