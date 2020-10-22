import { IUpdateSectionModel, IFindByEntity, IModel } from "./Interfaces";
import { WhereOptions } from "sequelize/types/lib/model";

export abstract class SectionRepository {
  public async updateSection<Model>({ sections, owner, transaction }: IUpdateSectionModel<Model>) {
    await this.modelClass().destroy({
      where: this.whereClause(owner),
      transaction
    });

    return this.modelClass().bulkCreate(
      sections.map(section => ({ ...section, ...this.whereClause(owner) })),
      { transaction, returning: true, validate: true }
    );
  }

  public findByEntity<Model>({ owner }: IFindByEntity<Model>) {
    return this.modelClass().findAll({ where: this.whereClause(owner) });
  }

  public truncate() {
    return this.modelClass().destroy({ truncate: true });
  }

  protected abstract modelClass();

  protected abstract whereClause<Model>(owner: IModel<Model>): WhereOptions;
}
