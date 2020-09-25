import { Secretary } from "$models/Admin";
import { AdminTaskType } from "$models/AdminTask/Model";
import { ApplicantType } from "$models/Applicant";
import { Offer } from "$models";

export const OfferTargetWhereClause = {
  build: ({ secretary, adminTaskTypes }: IStatusWhereClauseProps) => {
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
  }
};

interface IStatusWhereClauseProps {
  secretary: Secretary;
  adminTaskTypes: AdminTaskType[];
}
