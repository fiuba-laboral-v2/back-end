import { AllowNull, Column, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { Company, UserSequelizeModel } from "$models";

@Table
export class CompanyUser extends Model<CompanyUser> {
  @ForeignKey(() => Company)
  @AllowNull(false)
  @PrimaryKey
  @Column
  public companyUuid: string;

  @ForeignKey(() => UserSequelizeModel)
  @AllowNull(false)
  @PrimaryKey
  @Column
  public userUuid: string;
}
