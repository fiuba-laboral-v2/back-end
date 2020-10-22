import { IUpdateSectionModel, IFindByEntity } from "./Interfaces";

export abstract class SectionRepository {
  public async updateSection<Model>({ sections, model, transaction }: IUpdateSectionModel<Model>) {
    await this.modelClass().destroy({
      where: { [this.modelUuidKey()]: model.uuid },
      transaction
    });

    return this.modelClass().bulkCreate(
      sections.map(section => ({ ...section, [this.modelUuidKey()]: model.uuid })),
      { transaction, returning: true, validate: true }
    );
  }

  public findByEntity<Model>({ model }: IFindByEntity<Model>) {
    return this.modelClass().findAll({ where: { [this.modelUuidKey()]: model.uuid } });
  }

  public truncate() {
    return this.modelClass().destroy({ truncate: true });
  }

  protected abstract modelClass();

  protected abstract modelUuidKey(): string;
}
