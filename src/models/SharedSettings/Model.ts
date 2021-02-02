import { Column, Model, Table } from "sequelize-typescript";
import { BuildOptions, TEXT, UUID } from "sequelize";

@Table({ tableName: "SharedSettings", timestamps: false })
export class SharedSettings extends Model<SharedSettings> {
  @Column({ allowNull: false, primaryKey: true, type: UUID })
  public uuid: string;

  @Column({ type: TEXT, allowNull: false })
  public companySignUpAcceptanceCriteria: string;

  @Column({ type: TEXT, allowNull: false })
  public companyEditableAcceptanceCriteria: string;

  @Column({ type: TEXT, allowNull: false })
  public editOfferAcceptanceCriteria: string;
  constructor(values?: object, options?: BuildOptions) {
    super({ ...values, uuid: "6b228e77-9e8e-4438-872e-f3714a5846dd" }, options);
  }
}
