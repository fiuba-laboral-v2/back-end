import { TSection } from "$models/Applicant";
import { Applicant } from "$models";
import { Transaction } from "sequelize";

export interface IUpdate {
  sections: TSection[];
  applicant: Applicant;
  transaction?: Transaction;
}
