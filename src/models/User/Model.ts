import {
  AllowNull,
  BeforeCreate,
  Column,
  HasOne,
  Is,
  Model,
  Table,
  Unique
} from "sequelize-typescript";
import { compare, hashSync } from "bcrypt";
import { HasOneGetAssociationMixin, STRING, TEXT, UUID, UUIDV4 } from "sequelize";
import { Applicant } from "../Applicant/Model";
import { validateEmail, validateName, validatePassword } from "validations-fiuba-laboral-v2";

@Table
export class User extends Model<User> {
  @BeforeCreate
  public static beforeCreateHook(user: User): void {
    user.setPassword(user.password);
  }

  private static readonly bcryptSaltOrRounds = 10;

  @Column({
    allowNull: false,
    primaryKey: true,
    type: UUID,
    defaultValue: UUIDV4
  })
  public uuid: string;

  @Is(validateEmail)
  @Unique
  @AllowNull(false)
  @Column(STRING)
  public email: string;

  @AllowNull(false)
  @Column(STRING)
  public password: string;

  @Is(validateName)
  @Column({
    allowNull: false,
    type: TEXT
  })
  public name: string;

  @Is(validateName)
  @Column({
    allowNull: false,
    type: TEXT
  })
  public surname: string;

  @HasOne(() => Applicant, "userUuid")
  public applicant: Applicant;

  public getApplicant: HasOneGetAssociationMixin<Applicant>;

  public setPassword(password: string) {
    validatePassword(password);
    this.password = hashSync(password, User.bcryptSaltOrRounds);
  }

  public passwordMatches(password) {
    return compare(password, this.password);
  }
}
