import {
  Column,
  DataType,
  Model,
  Table,
  ForeignKey,
  BelongsTo, Is
} from "sequelize-typescript";
import { HasOneGetAssociationMixin } from "sequelize";
import { Company } from "../Company";
import { validatePositiveNumber, validateSalaryRange } from "validations-fiuba-laboral-v2";

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

  @Is("hoursPerDay", validatePositiveNumber)
  @Column({
    allowNull: false,
    type: DataType.INTEGER
  })
  public hoursPerDay: number;

  @Is("minimumSalary", validatePositiveNumber)
  @Column({
    allowNull: false,
    type: DataType.INTEGER
  })
  public minimumSalary: number;

  @Is("maximumSalary", validatePositiveNumber)
  @Column({
    allowNull: false,
    type: DataType.INTEGER
  })
  public maximumSalary: number;

  public getCompany: HasOneGetAssociationMixin<Company>;
}
