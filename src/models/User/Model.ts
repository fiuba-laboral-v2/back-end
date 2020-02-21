import { AllowNull, Column, DataType, Is, Model, PrimaryKey, Table } from "sequelize-typescript";
import { BuildOptions } from "sequelize";
import { compare, hashSync } from "bcrypt";
import { validateEmail, validatePassword } from "validations-fiuba-laboral-v2";

@Table
export class User extends Model<User> {
  @Is(validateEmail)
  @PrimaryKey
  @AllowNull(false)
  @Column(DataType.STRING)
  public email: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  public password: string;

  constructor(values?: object, options?: BuildOptions) {
    super(values, options);
    this.setPassword(this.password);
  }

  public setPassword(password: string) {
    validatePassword(password);
    this.password = hashSync(password, 10);
  }

  public passwordMatches(password) {
    return compare(password, this.password);
  }
}
