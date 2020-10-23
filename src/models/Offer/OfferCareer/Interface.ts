import { Transaction } from "sequelize";
import { Offer } from "$models";

export interface IOfferCareer {
  careerCode: string;
}

export interface IBulkCreate {
  careers: IOfferCareer[];
  offer: Offer;
  transaction?: Transaction;
}

export type IUpdate = IBulkCreate;
