import { AllowNull, BelongsTo, Column, ForeignKey, Model, Table } from "sequelize-typescript";
import { Company } from "../Company";
import { TEXT, UUID, UUIDV4 } from "sequelize";

@Table
export default class CompanyPhoto extends Model<CompanyPhoto> {
  @Column({
    allowNull: false,
    primaryKey: true,
    type: UUID,
    defaultValue: UUIDV4
  })
  public uuid: string;

  @AllowNull(false)
  @Column(TEXT)
  public photo: string;

  @ForeignKey(() => Company)
  @AllowNull(false)
  @Column(UUID)
  public companyUuid: string;

  @BelongsTo(() => Company)
  public company: Company;
}
