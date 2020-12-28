import { Column, CreatedAt, ForeignKey, Model, Table, UpdatedAt } from "sequelize-typescript";
import { ENUM, TEXT, UUID, UUIDV4 } from "sequelize";
import { ApprovalStatus, approvalStatuses } from "$models/ApprovalStatus";
import { Admin, Company } from "$models";
import { Nullable } from "$models/SequelizeModel";

@Table({ tableName: "CompanyApprovalEvents", timestamps: true })
export class CompanyApprovalEvent extends Model<CompanyApprovalEvent> {
  @Column({ allowNull: false, primaryKey: true, type: UUID, defaultValue: UUIDV4 })
  public uuid: string;

  @ForeignKey(() => Admin)
  @Column({ allowNull: false, references: { model: "Admins", key: "uuid" }, type: UUID })
  public userUuid: string;

  @ForeignKey(() => Company)
  @Column({ allowNull: false, references: { model: "Companies", key: "uuid" }, type: UUID })
  public companyUuid: string;

  @Column({ allowNull: true, type: TEXT })
  public moderatorMessage?: Nullable<string>;

  @Column({ allowNull: false, type: ENUM<string>({ values: approvalStatuses }) })
  public status: ApprovalStatus;

  @CreatedAt
  @Column
  public createdAt: Date;

  @UpdatedAt
  @Column
  public updatedAt: Date;
}
