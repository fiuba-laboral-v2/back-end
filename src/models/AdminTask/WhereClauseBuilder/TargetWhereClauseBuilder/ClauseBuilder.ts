import { Secretary } from "$models/Admin";
import { ApplicantType } from "$models/Applicant";
import { Applicant, ApplicantCareer, Offer } from "$models";
import { AdminTaskType } from "$models/AdminTask/Model";

export const TargetWhereClauseBuilder = {
  build: (variables: ITargetWhereClauseBuilder) =>
    [
      TargetWhereClauseBuilder.getOfferTargetWhereClause(variables),
      TargetWhereClauseBuilder.getApplicantTypeWhereClause(variables)
    ]
      .filter(clause => !!clause)
      .join(" AND "),
  getOfferTargetWhereClause: ({ secretary, adminTaskTypes }: ITargetWhereClauseBuilder) => {
    if (!adminTaskTypes.includes(AdminTaskType.Offer)) return;

    let targetApplicantType: ApplicantType;
    if (secretary === Secretary.graduados) {
      targetApplicantType = ApplicantType.graduate;
    } else {
      targetApplicantType = ApplicantType.student;
    }

    return `
      (
        "AdminTask"."targetApplicantType" = '${ApplicantType.both}' 
        OR "AdminTask"."targetApplicantType" = '${targetApplicantType}'
        OR "AdminTask"."tableNameColumn" != '${Offer.tableName}'
      )
    `;
  },
  getApplicantTypeWhereClause: ({ secretary, adminTaskTypes }: ITargetWhereClauseBuilder) => {
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

interface ITargetWhereClauseBuilder {
  secretary: Secretary;
  adminTaskTypes: AdminTaskType[];
}
