import { AdminTaskType } from "$models/AdminTask/Model";
import { Company, Offer } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";

export const OfferWithApprovedCompanyWhereClause = {
  build: ({ modelName }: IStatusWhereClauseProps) => {
    if (modelName !== AdminTaskType.Offer) return;

    return `
      (
        EXISTS (
            SELECT *
            FROM "${Company.tableName}"
            WHERE "${Offer.tableName}"."companyUuid" = "${Company.tableName}"."uuid"
            AND "${Company.tableName}"."approvalStatus" = '${ApprovalStatus.approved}'
        )
      )
    `;
  }
};

interface IStatusWhereClauseProps {
  modelName: AdminTaskType;
}
