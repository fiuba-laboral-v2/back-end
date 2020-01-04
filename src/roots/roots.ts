import {Table, Column, Model, DataType} from "sequelize-typescript";

@Table
export default class Roots extends Model<Roots> {
  @Column(DataType.TEXT)
  public title: string;
}
