import { IUpdateSectionModel, IFindByEntity } from "./Interfaces";

export abstract class SectionRepository {
  public async updateSection<Entity>({
    sections,
    entity,
    transaction
  }: IUpdateSectionModel<Entity>) {
    await this.modelClass().destroy({
      where: { [this.entityUuidKey()]: entity.uuid },
      transaction
    });

    return this.modelClass().bulkCreate(
      sections.map(section => ({ ...section, [this.entityUuidKey()]: entity.uuid })),
      { transaction, returning: true, validate: true }
    );
  }

  public findByEntity<Entity>({ entity }: IFindByEntity<Entity>) {
    return this.modelClass().findAll({ where: { [this.entityUuidKey()]: entity.uuid } });
  }

  public truncate() {
    return this.modelClass().destroy({ truncate: true });
  }

  protected abstract modelClass();

  protected abstract entityUuidKey(): string;
}
