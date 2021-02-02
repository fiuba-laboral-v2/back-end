import { CreatedAt, UpdatedAt, Column, ForeignKey, PrimaryKey, Table } from "sequelize-typescript";
import { Company, UserSequelizeModel } from "$models";
import { UUID, TEXT } from "sequelize";
import { isUuid } from "$models/SequelizeModelValidators";
import { SequelizeModel } from "$models/SequelizeModel";

@Table({ tableName: "CompanyUsers", timestamps: true })
export class CompanyUser extends SequelizeModel<CompanyUser> {
  @ForeignKey(() => Company)
  @PrimaryKey
  @Column({ allowNull: false, type: UUID, ...isUuid })
  public companyUuid: string;

  @ForeignKey(() => UserSequelizeModel)
  @PrimaryKey
  @Column({ allowNull: false, type: UUID, ...isUuid })
  public userUuid: string;

  @Column({ allowNull: false, type: TEXT })
  public position: string;

  @CreatedAt
  @Column
  public createdAt: Date;

  @UpdatedAt
  @Column
  public updatedAt: Date;
}
