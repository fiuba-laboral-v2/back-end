import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table
} from "sequelize-typescript";
import { Company } from "../Company";

@Table
export default class CompanyPhoneNumber extends Model<CompanyPhoneNumber> {
  @Column({
    primaryKey: true,
    allowNull: false,
    type: DataType.STRING
  })
  public phoneNumber: number;

  @ForeignKey(() => Company)
  @Column({
    primaryKey: true,
    allowNull: false,
    type: DataType.UUID
  })
  public companyUuid: string;

  @BelongsTo(() => Company)
  public company: Company;
}
