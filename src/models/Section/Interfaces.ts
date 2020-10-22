import { ISection } from "$models/Applicant";
import { Transaction } from "sequelize";
import { Model as SequelizeModel } from "sequelize-typescript";

export type IModel<T> = { uuid: string } & SequelizeModel<T>;

export interface IUpdateSectionModel<Model> extends IUpdateProps {
  owner: IModel<Model>;
}

export interface IFindByEntity<Model> {
  owner: IModel<Model>;
}

export interface IUpdateProps {
  sections: ISection[];
  transaction?: Transaction;
}
