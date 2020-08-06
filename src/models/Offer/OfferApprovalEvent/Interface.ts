import { Transaction } from "sequelize";
import { Offer } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";

export interface ICreateOfferApprovalEvent {
  adminUserUuid: string;
  offer: Offer;
  status: ApprovalStatus;
  transaction?: Transaction;
}
