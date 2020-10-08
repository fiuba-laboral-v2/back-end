import { BelongsTo, Column, ForeignKey, Model, Table } from "sequelize-typescript";
import { INTEGER, TEXT, UUID, UUIDV4 } from "sequelize";
import { Applicant } from "$models";
import { isUuid } from "$models/SequelizeModelValidators";

@Table({ tableName: "ApplicantKnowledgeSections" })
export class Section extends Model<Section> {
  @Column({
    allowNull: false,
    primaryKey: true,
    type: UUID,
    defaultValue: UUIDV4,
    ...isUuid
  })
  public uuid: string;

  @ForeignKey(() => Applicant)
  @Column({
    allowNull: false,
    type: UUID,
    ...isUuid
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
