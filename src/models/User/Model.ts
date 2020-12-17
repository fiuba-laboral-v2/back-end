import { BeforeCreate, Column, HasOne, Table } from "sequelize-typescript";
import { compare, hashSync } from "bcrypt";
import { HasOneGetAssociationMixin, STRING, TEXT } from "sequelize";
import { Admin, Applicant, Company, CompanyUser } from "$models";
import { SequelizeModel } from "$models/SequelizeModel";
import { MissingDniError } from "./Errors";
import { validateEmail, validateName, validatePassword } from "validations-fiuba-laboral-v2";

@Table({
  tableName: "Users",
  validate: {
    validateUser(this: User) {
      this.validateUser();
    }
  }
})
export class User extends SequelizeModel<User> {
  @BeforeCreate
  public static beforeCreateUserHook(user: User): void {
    super.beforeCreateHook(user);
    if (!user.password) return;
    user.setPassword(user.password);
  }

  private static readonly bcryptSaltOrRounds = 10;
  @Column({
    allowNull: true,
    type: STRING
  })
  public password: string;

  @Column({
    allowNull: false,
    unique: true,
    type: STRING,
    validate: { validateEmail }
  })
  public email: string;

  @Column({
    allowNull: true,
    unique: true,
    type: STRING
  })
  public dni: string;

  @Column({
    allowNull: false,
    type: TEXT,
    validate: { validateName }
  })
  public name: string;

  @Column({
    allowNull: false,
    type: TEXT,
    validate: { validateName }
  })
  public surname: string;

  @HasOne(() => Applicant, "userUuid")
  public applicant: Applicant;

  @HasOne(() => CompanyUser, "userUuid")
  public companyUser: CompanyUser;

  @HasOne(() => Admin, "userUuid")
  public admin: Admin;

  public getApplicant: HasOneGetAssociationMixin<Applicant>;
  public getCompanyUser: HasOneGetAssociationMixin<CompanyUser>;
  public getAdmin: HasOneGetAssociationMixin<Admin>;

  public async getCompany() {
    const companyUser = await this.getCompanyUser();
    if (companyUser) return Company.findByPk(companyUser.companyUuid);
    return;
  }

  public setPassword(password: string) {
    validatePassword(password);
    this.password = hashSync(password, User.bcryptSaltOrRounds);
  }

  public passwordMatches(password) {
    return compare(password, this.password);
  }

  public validateUser() {
    if (!this.isFiubaUser()) return;
    if (!this.dni) throw new MissingDniError();
  }

  public isFiubaUser() {
    return !this.password;
  }
}
