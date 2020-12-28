import { Column, Table } from "sequelize-typescript";
import { STRING, TEXT } from "sequelize";
import { SequelizeModel, Nullable } from "$models/SequelizeModel";
import { MissingDniError } from "./Errors";
import { validateEmail, validateName } from "validations-fiuba-laboral-v2";

@Table({
  tableName: "Users",
  validate: {
    validateUser(this: UserSequelizeModel) {
      this.validateUser();
    }
  }
})
export class UserSequelizeModel extends SequelizeModel<UserSequelizeModel> {
  @Column({ allowNull: false, type: TEXT, validate: { validateName } })
  public name: string;

  @Column({ allowNull: false, type: TEXT, validate: { validateName } })
  public surname: string;

  @Column({ allowNull: true, type: STRING })
  public password: Nullable<string>;

  @Column({ allowNull: false, unique: true, type: STRING, validate: { validateEmail } })
  public email: string;

  @Column({ allowNull: true, unique: true, type: STRING })
  public dni: Nullable<string>;

  public validateUser() {
    if (!this.isFiubaUser()) return;
    if (!this.dni) throw new MissingDniError();
  }

  public isFiubaUser() {
    return !this.password;
  }
}
