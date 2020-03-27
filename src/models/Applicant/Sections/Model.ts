import {
  Column,
  DataType,
  Model,
  Table,
} from "sequelize-typescript";

@Table({
  tableName: "Sections"
})
export class Section extends Model<Section> {
  @Column({
    allowNull: false,
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4
  })
  public uuid: string;

  @Column({
    allowNull: false,
    type: DataType.TEXT
  })
  public title: string;

  @Column({
    allowNull: false,
    type: DataType.TEXT
  })
  public description: string;
}
