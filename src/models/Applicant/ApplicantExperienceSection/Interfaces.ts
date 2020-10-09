import { ISection } from "$models/Applicant";
import { Applicant } from "$models";
import { Transaction } from "sequelize";

export interface IUpdate {
  sections: ISection[];
  applicant: Applicant;
  transaction?: Transaction;
}
