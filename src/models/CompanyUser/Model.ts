import { Column, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { Company } from "../Company/Model";
import { User } from "../User/Model";

@Table
export class CompanyUser extends Model<CompanyUser> {
  @ForeignKey(() => Company)
  @PrimaryKey
  @Column
  public companyUuid: string;

  @ForeignKey(() => User)
  @PrimaryKey
  @Column
  public userUuid: string;
}
