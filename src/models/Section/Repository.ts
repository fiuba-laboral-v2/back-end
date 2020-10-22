import { IUpdateSectionModel, IFindByEntity } from "./Interfaces";

export abstract class SectionRepository {
  public async updateSection<Model>({ sections, owner, transaction }: IUpdateSectionModel<Model>) {
    await this.modelClass().destroy({
      where: { [this.modelUuidKey()]: owner.uuid },
      transaction
    });

    return this.modelClass().bulkCreate(
      sections.map(section => ({ ...section, [this.modelUuidKey()]: owner.uuid })),
      { transaction, returning: true, validate: true }
    );
  }

  public findByEntity<Model>({ owner }: IFindByEntity<Model>) {
    return this.modelClass().findAll({ where: { [this.modelUuidKey()]: owner.uuid } });
  }

  public truncate() {
    return this.modelClass().destroy({ truncate: true });
  }

  protected abstract modelClass();

  protected abstract modelUuidKey(): string;
}
