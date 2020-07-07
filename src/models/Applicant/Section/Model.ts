import { BelongsTo, Column, ForeignKey, Model, Table } from "sequelize-typescript";
import { Applicant } from "../..";
import { INTEGER, TEXT, UUID, UUIDV4 } from "sequelize";

@Table({ tableName: "Sections" })
export class Section extends Model<Section> {
  @Column({
    allowNull: false,
    primaryKey: true,
    type: UUID,
    defaultValue: UUIDV4
  })
  public uuid: string;

  @ForeignKey(() => Applicant)
  @Column({
    allowNull: false,
    type: UUID
  })
  public applicantUuid: string;

  @BelongsTo(() => Applicant)
  public applicant: Applicant;

  @Column({
    allowNull: false,
    type: TEXT
  })
  public title: string;

  @Column({
    allowNull: false,
    type: TEXT
  })
  public text: string;

  @Column({
    allowNull: false,
    autoIncrement: true,
    type: INTEGER
  })
  public displayOrder: number;
}
