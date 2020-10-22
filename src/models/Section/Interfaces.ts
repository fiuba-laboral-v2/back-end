import { ISection } from "$models/Applicant";
import { Transaction } from "sequelize";
import { Model } from "sequelize-typescript";

export type IEntity<T> = { uuid: string } & Model<T>;

export interface IUpdateSectionModel<Entity> extends IUpdateProps {
  entity: IEntity<Entity>;
}

export interface IFindByEntity<Entity> {
  entity: IEntity<Entity>;
}

export interface IUpdateProps {
  sections: ISection[];
  transaction?: Transaction;
}
