import { Column, Model, Table, BelongsTo } from "sequelize-typescript";
import { DATE, UUID, UUIDV4, ENUM, HasOneGetAssociationMixin } from "sequelize";
import { ApprovalStatus, approvalStatuses } from "../../ApprovalStatus";
import { Company } from "../../Company";
import { Admin } from "../../Admin";

@Table({ tableName: "CompanyApprovalEvents" })
export class CompanyApprovalEvent extends Model<CompanyApprovalEvent> {
  @Column({
    allowNull: false,
    primaryKey: true,
    type: UUID,
    defaultValue: UUIDV4
  })
  public uuid: string;

  @Column({
    allowNull: false,
    references: { model: "Admins", key: "uuid" },
    type: UUID
  })
  public adminUuid: string;

  @Column({
    allowNull: false,
    references: { model: "Companies", key: "uuid" },
    type: UUID
  })
  public companyUuid: string;

  @Column({
    allowNull: false,
    type: ENUM<string>({ values: approvalStatuses })
  })
  public status: ApprovalStatus;

  @Column({
    allowNull: false,
    type: DATE,
    defaultValue: new Date(Date.now())
  })
  public createdAt: Date;

  @Column({
    allowNull: false,
    type: DATE,
    defaultValue: new Date(Date.now())
  })
  public updatedAt: Date;

  @BelongsTo(() => Admin, "adminUuid")
  public admin: Admin;

  @BelongsTo(() => Company, "companyUuid")
  public company: Company;

  public getCompany: HasOneGetAssociationMixin<Company>;
  public getAdmin: HasOneGetAssociationMixin<Admin>;
}
