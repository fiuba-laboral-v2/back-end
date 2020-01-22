import { AllowNull, Column, DataType, Model, Table } from "sequelize-typescript";

@Table
export default class Root extends Model<Root> {
  @AllowNull(false)
  @Column(DataType.TEXT)
  public title: string;
}
