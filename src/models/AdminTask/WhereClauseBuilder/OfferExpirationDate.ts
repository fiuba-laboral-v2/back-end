import { Secretary } from "$models/Admin";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { AdminTaskType } from "$models/AdminTask/Model";
import { Offer } from "$models";

export const OfferExpirationDateWhereClause = {
  build: ({ secretary, modelName }: IStatusWhereClauseProps) => {
    if (modelName !== AdminTaskType.Offer) return;

    let expirationDateProperty: string;
    let approvalStatusProperty: string;
    if (secretary === Secretary.graduados) {
      expirationDateProperty = "graduatesExpirationDateTime";
      approvalStatusProperty = "graduadosApprovalStatus";
    } else {
      expirationDateProperty = "studentsExpirationDateTime";
      approvalStatusProperty = "extensionApprovalStatus";
    }

    return `
      (
        NOT 
        (
          "${Offer.tableName}"."${expirationDateProperty}" < '${new Date().toISOString()}'
          AND
          "${Offer.tableName}"."${approvalStatusProperty}" = '${ApprovalStatus.approved}'
        )
      )
    `;
  }
};

interface IStatusWhereClauseProps {
  secretary: Secretary;
  modelName: AdminTaskType;
}
