import { Column, Model, Table, BelongsTo } from "sequelize-typescript";
import { DATE, UUID, UUIDV4, ENUM, HasOneGetAssociationMixin } from "sequelize";
import { ApprovalStatus, approvalStatuses } from "../../ApprovalStatus";
import { Company } from "../../Company";
import { User } from "../../User";

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
    references: { model: "Users", key: "uuid" },
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
    defaultValue: Date.now()
  })
  public createdAt: Date;

  @Column({
    allowNull: false,
    type: DATE,
    defaultValue: Date.now()
  })
  public updatedAt: Date;

  @BelongsTo(() => User, "adminUuid")
  public admin: User;

  @BelongsTo(() => Company, "companyUuid")
  public company: Company;

  public getCompany: HasOneGetAssociationMixin<Company>;
  public getAdmin: HasOneGetAssociationMixin<User>;
}
