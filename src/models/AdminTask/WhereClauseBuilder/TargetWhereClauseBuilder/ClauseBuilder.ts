import { Secretary } from "$models/Admin";
import { ApplicantType } from "$models/Applicant";
import { Offer } from "$models";
import { AdminTaskType } from "$models/AdminTask/Model";

export const TargetWhereClauseBuilder = {
  build: (variables: ITargetWhereClauseBuilder) =>
    [TargetWhereClauseBuilder.getOfferTargetWhereClause(variables)]
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
      "AdminTask"."targetApplicantType" = '${ApplicantType.both}' 
      OR "AdminTask"."targetApplicantType" = '${targetApplicantType}'
      OR "AdminTask"."tableNameColumn" != '${Offer.tableName}'
    `;
  }
};

interface ITargetWhereClauseBuilder {
  secretary: Secretary;
  adminTaskTypes: AdminTaskType[];
}
