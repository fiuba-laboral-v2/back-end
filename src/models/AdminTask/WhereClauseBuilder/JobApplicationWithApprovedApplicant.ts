import { AdminTaskType } from "$models/AdminTask/Model";
import { Applicant, JobApplication } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";

export const JobApplicationWithApprovedApplicantWhereClause = {
  build: ({ modelName }: IStatusWhereClauseProps) => {
    if (modelName !== AdminTaskType.JobApplication) return;

    return `
      (
        EXISTS (
            SELECT *
            FROM "${Applicant.tableName}"
            WHERE "${JobApplication.tableName}"."applicantUuid" = "${Applicant.tableName}"."uuid"
            AND "${Applicant.tableName}"."approvalStatus" = '${ApprovalStatus.approved}'
        )
      )
    `;
  }
};

interface IStatusWhereClauseProps {
  modelName: AdminTaskType;
}
