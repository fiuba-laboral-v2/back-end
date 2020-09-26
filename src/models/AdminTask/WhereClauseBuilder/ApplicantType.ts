import { Secretary } from "$models/Admin";
import { Applicant, ApplicantCareer } from "$models";
import { AdminTaskType } from "$models/AdminTask/Model";

export const ApplicantTypeWhereClause = {
  build: ({ secretary, adminTaskTypes }: IApplicantTypeWhereClauseProps) => {
    if (!adminTaskTypes.includes(AdminTaskType.Applicant)) return;

    return `
      (
        "AdminTask"."tableNameColumn" != '${Applicant.tableName}'
        OR ${secretary === Secretary.graduados ? "" : "NOT"} EXISTS(
          SELECT *
          FROM "${ApplicantCareer.tableName}"
          WHERE "applicantUuid" = "AdminTask"."uuid" AND "isGraduate" = true
        )
      )
    `;
  }
};

interface IApplicantTypeWhereClauseProps {
  secretary: Secretary;
  adminTaskTypes: AdminTaskType[];
}
