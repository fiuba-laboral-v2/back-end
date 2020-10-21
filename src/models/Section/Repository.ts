import { IUpdateSectionModel, SectionType, IFindByEntity } from "./Interfaces";

export const SectionRepository = {
  update: async <Section, Entity>({
    entityUuidKey,
    modelClass,
    sections,
    entity,
    transaction
  }: IUpdateSectionModel<Section, Entity>) => {
    await modelClass.destroy({ where: { [entityUuidKey]: entity.uuid }, transaction });

    return modelClass.bulkCreate(
      sections.map(section => ({ ...section, [entityUuidKey]: entity.uuid })),
      {
        transaction,
        returning: true,
        validate: true
      }
    );
  },
  findByEntity: <Section, Entity>({
    entity,
    modelClass,
    entityUuidKey
  }: IFindByEntity<Section, Entity>) =>
    modelClass.findAll({ where: { [entityUuidKey]: entity.uuid } }),
  truncate: <Section>(modelClass: SectionType<Section>) => modelClass.destroy({ truncate: true })
};
