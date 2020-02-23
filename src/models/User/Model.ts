import {
  AllowNull,
  BeforeCreate,
  Column,
  DataType,
  Is,
  Model,
  Table,
  Unique
} from "sequelize-typescript";
import { compare, hashSync } from "bcrypt";
import { validateEmail, validatePassword } from "validations-fiuba-laboral-v2";

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
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4
  })
  public uuid: string;

  @Is(validateEmail)
  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  public email: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  public password: string;

  public setPassword(password: string) {
    validatePassword(password);
    this.password = hashSync(password, User.bcryptSaltOrRounds);
  }

  public passwordMatches(password) {
    return compare(password, this.password);
  }
}
