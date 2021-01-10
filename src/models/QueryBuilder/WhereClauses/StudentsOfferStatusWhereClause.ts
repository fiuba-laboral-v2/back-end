import { Op } from "sequelize";
import { WhereOptions } from "sequelize/types/lib/model";
import { OfferStatus } from "$models/Offer";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { ApplicantType } from "$models/Applicant";

export const StudentsOfferStatusWhereClause = {
  build: ({ studentsStatus }: IBuild): WhereOptions | undefined => {
    if (!studentsStatus) return;
    const clause: { [Op.and]: WhereOptions[] } = { [Op.and]: [] };
    const targets = [ApplicantType.both, ApplicantType.student];

    if (studentsStatus === OfferStatus.expired) {
      clause[Op.and].push({ extensionApprovalStatus: ApprovalStatus.approved });
      clause[Op.and].push({ studentsExpirationDateTime: { [Op.lt]: new Date() } });
    } else if (studentsStatus !== OfferStatus.approved) {
      clause[Op.and].push({ extensionApprovalStatus: studentsStatus });
      clause[Op.and].push({ studentsExpirationDateTime: null });
    } else {
      clause[Op.and].push({ extensionApprovalStatus: OfferStatus.approved });
      clause[Op.and].push({ studentsExpirationDateTime: { [Op.gte]: new Date() } });
    }
    clause[Op.and].push({ targetApplicantType: { [Op.in]: targets } });
    return clause;
  }
};

interface IBuild {
  studentsStatus?: OfferStatus;
}
