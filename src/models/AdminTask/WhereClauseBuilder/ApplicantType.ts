import { Secretary } from "$models/Admin";
import { ApplicantCareer, Applicant } from "$models";
import { AdminTaskType } from "$models/AdminTask/Model";

export const ApplicantTypeWhereClause = {
  build: ({ secretary, modelName }: IApplicantTypeWhereClauseProps) => {
    if (modelName !== AdminTaskType.Applicant) return;

    return `
      (
        ${secretary === Secretary.graduados ? "" : "NOT"} EXISTS(
          SELECT *
          FROM "${ApplicantCareer.tableName}"
          WHERE "applicantUuid" = "${Applicant.tableName}"."uuid" AND "isGraduate" = true
        )
      )
    `;
  }
};

interface IApplicantTypeWhereClauseProps {
  secretary: Secretary;
  modelName: AdminTaskType;
}
