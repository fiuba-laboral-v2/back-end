import { AdminTaskType } from "$models/AdminTask/Model";
import { Offer, JobApplication } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Secretary } from "$models/Admin";

export const JobApplicationWithApprovedOfferWhereClause = {
  build: ({ secretary, modelName }: IStatusWhereClauseProps) => {
    if (modelName !== AdminTaskType.JobApplication) return;

    const approvalStatusProperty = {
      [Secretary.graduados]: "graduadosApprovalStatus",
      [Secretary.extension]: "extensionApprovalStatus"
    }[secretary];

    return `
      (
        EXISTS (
            SELECT *
            FROM "${Offer.tableName}"
            WHERE "${JobApplication.tableName}"."offerUuid" = "${Offer.tableName}"."uuid"
            AND "${Offer.tableName}"."${approvalStatusProperty}" = '${ApprovalStatus.approved}'
        )
      )
    `;
  }
};

interface IStatusWhereClauseProps {
  secretary: Secretary;
  modelName: AdminTaskType;
}
