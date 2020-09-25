import { Secretary } from "$models/Admin";
import { JobApplication, ApplicantCareer } from "$models";
import { AdminTaskType } from "$models/AdminTask/Model";

export const JobApplicationTargetWhereClause = {
  build: ({ secretary, adminTaskTypes }: IJobApplicationTargetWhereClauseProps) => {
    if (!adminTaskTypes.includes(AdminTaskType.JobApplication)) return;

    return `
      (
        "AdminTask"."tableNameColumn" != '${JobApplication.tableName}'
        OR ${secretary === Secretary.graduados ? "" : "NOT"} EXISTS(
          SELECT *
          FROM "${ApplicantCareer.tableName}"
          WHERE "applicantUuid" = "AdminTask"."applicantUuid" AND "isGraduate" = true
        )
      )
    `;
  }
};

interface IJobApplicationTargetWhereClauseProps {
  secretary: Secretary;
  adminTaskTypes: AdminTaskType[];
}
