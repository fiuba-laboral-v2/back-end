import { Secretary } from "$models/Admin";
import { AdminTaskType } from "$models/AdminTask/Model";
import { ApplicantType } from "$models/Applicant";
import { Offer } from "$models";

export const OfferTargetWhereClause = {
  build: ({ secretary, modelName }: IStatusWhereClauseProps) => {
    if (modelName !== AdminTaskType.Offer) return;

    let targetApplicantType: ApplicantType;
    if (secretary === Secretary.graduados) {
      targetApplicantType = ApplicantType.graduate;
    } else {
      targetApplicantType = ApplicantType.student;
    }

    return `
      (
        "${Offer.tableName}"."targetApplicantType" = '${ApplicantType.both}'
        OR "${Offer.tableName}"."targetApplicantType" = '${targetApplicantType}'
      )
    `;
  }
};

interface IStatusWhereClauseProps {
  secretary: Secretary;
  modelName: AdminTaskType;
}
