import { Op } from "sequelize";
import { WhereOptions } from "sequelize/types/lib/model";
import { ApplicantType } from "$models/Applicant";
import { ApprovalStatus } from "$models/ApprovalStatus";

export const ApprovedOfferTargetWhereClause = {
  build: ({ applicantType }: IBuild): WhereOptions | undefined => {
    if (!applicantType) return;
    const targetsBoth = applicantType === ApplicantType.both;
    const targetsStudents = targetsBoth || applicantType === ApplicantType.student;
    const targetsGraduates = targetsBoth || applicantType === ApplicantType.graduate;
    const clause: { [Op.or]: WhereOptions[] } = { [Op.or]: [] };

    if (targetsStudents) {
      clause[Op.or].push({
        [Op.and]: [
          { extensionApprovalStatus: ApprovalStatus.approved },
          {
            targetApplicantType: {
              [Op.in]: [ApplicantType.both, ApplicantType.student]
            }
          },
          { studentsExpirationDateTime: { [Op.gte]: new Date() } }
        ]
      });
    }

    if (targetsGraduates) {
      clause[Op.or].push({
        [Op.and]: [
          { graduadosApprovalStatus: ApprovalStatus.approved },
          {
            targetApplicantType: {
              [Op.in]: [ApplicantType.both, ApplicantType.graduate]
            }
          },
          { graduatesExpirationDateTime: { [Op.gte]: new Date() } }
        ]
      });
    }

    return clause;
  }
};

interface IBuild {
  applicantType?: ApplicantType;
}
