import {
  Column,
  DataType,
  Model,
  Table,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import { HasOneGetAssociationMixin } from "sequelize";

import { Company } from "../Company";

@Table
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

  @Column({
    allowNull: false,
    type: DataType.INTEGER
  })
  public hoursPerDay: string;

  @Column({
    allowNull: false,
    type: DataType.FLOAT
  })
  public minimumSalary: string;

  @Column({
    allowNull: false,
    type: DataType.FLOAT
  })
  public maximumSalary: string;

  @Column({
    allowNull: false,
    type: DataType.DATE
  })
  public createdAt: string;

  @Column({
    allowNull: false,
    type: DataType.DATE
  })
  public updatedAt: string;

  public getCompany: HasOneGetAssociationMixin<Company>;
}
