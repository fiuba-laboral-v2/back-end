import { ISection } from "$models/Applicant";
import { Transaction } from "sequelize";
import { Model } from "sequelize-typescript";

export type SectionType<Section> = typeof Model & (new (...values) => Section);

export type IEntity<T> = { uuid: string } & Model<T>;

export interface IUpdateSectionModel<Section, Entity> extends IUpdateProps {
  modelClass: SectionType<Section>;
  entityUuidKey: string;
  entity: IEntity<Entity>;
}

export interface IFindByEntity<Section, Entity> {
  entity: IEntity<Entity>;
  modelClass: SectionType<Section>;
  entityUuidKey: string;
}

export interface IUpdateProps {
  sections: ISection[];
  transaction?: Transaction;
}
