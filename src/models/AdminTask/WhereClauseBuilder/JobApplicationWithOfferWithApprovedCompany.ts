import { AdminTaskType } from "$models/AdminTask/Model";
import { Company, JobApplication, Offer } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";

export const JobApplicationWithOfferWithApprovedCompanyWhereClause = {
  build: ({ modelName }: IStatusWhereClauseProps) => {
    if (modelName !== AdminTaskType.JobApplication) return;

    return `
      (
        EXISTS (
            SELECT *
            FROM "${Offer.tableName}"
            WHERE "${JobApplication.tableName}"."offerUuid" = "${Offer.tableName}"."uuid"
            AND EXISTS (
              SELECT *
              FROM "${Company.tableName}"
              WHERE "${Offer.tableName}"."companyUuid" = "${Company.tableName}"."uuid"
              AND "${Company.tableName}"."approvalStatus" = '${ApprovalStatus.approved}'
            )
        )
      )
    `;
  }
};

interface IStatusWhereClauseProps {
  modelName: AdminTaskType;
}
