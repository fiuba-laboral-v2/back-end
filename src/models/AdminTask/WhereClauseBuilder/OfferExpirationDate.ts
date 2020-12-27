import { Secretary } from "$models/Admin";
import { AdminTaskType } from "$models/AdminTask/Model";
import { Offer } from "$models";

export const OfferExpirationDateWhereClause = {
  build: ({ secretary, modelName }: IStatusWhereClauseProps) => {
    if (modelName !== AdminTaskType.Offer) return;

    let expirationDateProperty: string;
    if (secretary === Secretary.graduados) {
      expirationDateProperty = "graduatesExpirationDateTime";
    } else {
      expirationDateProperty = "studentsExpirationDateTime";
    }

    return `
      (
        "${Offer.tableName}"."${expirationDateProperty}" IS NOT NULL
        AND
        "${Offer.tableName}"."${expirationDateProperty}" > '${new Date().toISOString()}'
      )
    `;
  }
};

interface IStatusWhereClauseProps {
  secretary: Secretary;
  modelName: AdminTaskType;
}
