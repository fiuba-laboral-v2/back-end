import { BelongsTo, Column, ForeignKey, Is, Model, Table } from "sequelize-typescript";
import { validatePhoneNumber } from "validations-fiuba-laboral-v2";
import { STRING, UUID } from "sequelize";
import { Company } from "..";

@Table
export class CompanyPhoneNumber extends Model<CompanyPhoneNumber> {
  @Is(validatePhoneNumber)
  @Column({
    primaryKey: true,
    allowNull: false,
    type: STRING
  })
  public phoneNumber: number;

  @ForeignKey(() => Company)
  @Column({
    primaryKey: true,
    allowNull: false,
    type: UUID
  })
  public companyUuid: string;

  @BelongsTo(() => Company)
  public company: Company;
}
