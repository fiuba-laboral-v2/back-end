import { BelongsTo, Column, ForeignKey, Model, Table } from "sequelize-typescript";
import { DATE, ENUM, HasOneGetAssociationMixin, UUID, UUIDV4 } from "sequelize";
import { ApprovalStatus, approvalStatuses } from "$models/ApprovalStatus";
import { Admin, Company } from "$models";

@Table({ tableName: "CompanyApprovalEvents" })
export class CompanyApprovalEvent extends Model<CompanyApprovalEvent> {
  @Column({
    allowNull: false,
    primaryKey: true,
    type: UUID,
    defaultValue: UUIDV4
  })
  public uuid: string;

  @ForeignKey(() => Admin)
  @Column({
    allowNull: false,
    references: { model: "Admins", key: "uuid" },
    type: UUID
  })
  public userUuid: string;

  @ForeignKey(() => Company)
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
    defaultValue: new Date()
  })
  public createdAt: Date;

  @Column({
    allowNull: false,
    type: DATE,
    defaultValue: new Date()
  })
  public updatedAt: Date;

  @BelongsTo(() => Admin, "userUuid")
  public admin: Admin;

  @BelongsTo(() => Company, "companyUuid")
  public company: Company;

  public getCompany: HasOneGetAssociationMixin<Company>;
  public getAdmin: HasOneGetAssociationMixin<Admin>;
}
