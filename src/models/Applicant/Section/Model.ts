import {
  Column,
  DataType,
  Model,
  Table,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { Applicant } from "../Model";

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

  @ForeignKey(() => Applicant)
  @Column({
    allowNull: false,
    type: DataType.UUID
  })
  public applicantUuid: string;

  @BelongsTo(() => Applicant)
  public applicant: Applicant;

  @Column({
    allowNull: false,
    type: DataType.TEXT
  })
  public title: string;

  @Column({
    allowNull: false,
    type: DataType.TEXT
  })
  public text: string;
}
