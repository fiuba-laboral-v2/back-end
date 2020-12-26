import { Column, Model, Table } from "sequelize-typescript";
import { STRING, UUID } from "sequelize";

@Table({ tableName: "SharedSettings", timestamps: false })
export class SharedSettings extends Model<SharedSettings> {
  @Column({ allowNull: false, primaryKey: true, type: UUID })
  public uuid: string;

  @Column({ type: STRING, allowNull: false })
  public companySignUpAcceptanceCriteria: string;

  @Column({ type: STRING, allowNull: false })
  public companyEditableAcceptanceCriteria: string;

  @Column({ type: STRING, allowNull: false })
  public editOfferAcceptanceCriteria: string;
}
