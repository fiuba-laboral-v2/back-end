import { Table, Column, Model, DataType, AllowNull } from "sequelize-typescript";

@Table
export default class Root extends Model<Root> {
  @AllowNull(false)
  @Column(DataType.TEXT)
  public title: string;
}
