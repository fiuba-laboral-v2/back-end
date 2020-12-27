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
        "${Offer.tableName}"."${expirationDateProperty}" > '${new Date().toISOString()}'
        OR
        ( 
          "${Offer.tableName}"."${expirationDateProperty}" IS NULL
          AND
          (
            "${Offer.tableName}"."${approvalStatusProperty}" = '${ApprovalStatus.pending}'
            OR
            "${Offer.tableName}"."${approvalStatusProperty}" = '${ApprovalStatus.rejected}'
          )
        )
      )
    `;
  }
};

interface IStatusWhereClauseProps {
  secretary: Secretary;
  modelName: AdminTaskType;
}
