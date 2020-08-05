import { Transaction } from "sequelize";
import { Offer } from "../..";
import { ApprovalStatus } from "../../ApprovalStatus";

export interface ICreateOfferApprovalEvent {
  adminUserUuid: string;
  offer: Offer;
  status: ApprovalStatus;
  transaction?: Transaction;
}
