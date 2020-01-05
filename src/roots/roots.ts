import {Table, Column, Model, DataType, AllowNull} from "sequelize-typescript";

@Table
export default class Roots extends Model<Roots> {
  @AllowNull(false)
  @Column(DataType.TEXT)
  public title!: string;

  constructor(record?: any) {
    super(record);
    this.title = record!.title!;
  }
}
