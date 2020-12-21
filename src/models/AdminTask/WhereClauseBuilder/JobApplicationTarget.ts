import { Secretary } from "$models/Admin";
import { ApplicantCareer, JobApplication } from "$models";
import { AdminTaskType } from "$models/AdminTask/Model";

export const JobApplicationTargetWhereClause = {
  build: ({ secretary, modelName }: IJobApplicationTargetWhereClauseProps) => {
    if (modelName !== AdminTaskType.JobApplication) return;

    return `
      (
        ${secretary === Secretary.graduados ? "" : "NOT"} EXISTS(
          SELECT *
          FROM "${ApplicantCareer.tableName}"
          WHERE "applicantUuid" = "${JobApplication.tableName}"."applicantUuid"
          AND "isGraduate" = true
        )
      )
    `;
  }
};

interface IJobApplicationTargetWhereClauseProps {
  secretary: Secretary;
  modelName: AdminTaskType;
}
