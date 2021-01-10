import { Op } from "sequelize";
import { WhereOptions } from "sequelize/types/lib/model";
import { OfferStatus } from "$models/Offer";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { ApplicantType } from "$models/Applicant";

export const GraduatesOfferStatusWhereClause = {
  build: ({ graduatesStatus }: IBuild): WhereOptions | undefined => {
    if (!graduatesStatus) return;
    const clause: { [Op.and]: WhereOptions[] } = { [Op.and]: [] };
    const targets = [ApplicantType.both, ApplicantType.graduate];

    if (graduatesStatus === OfferStatus.expired) {
      clause[Op.and].push({ graduadosApprovalStatus: ApprovalStatus.approved });
      clause[Op.and].push({ graduatesExpirationDateTime: { [Op.lt]: new Date() } });
    } else if (graduatesStatus !== OfferStatus.approved) {
      clause[Op.and].push({ graduadosApprovalStatus: graduatesStatus });
      clause[Op.and].push({ graduatesExpirationDateTime: null });
    } else {
      clause[Op.and].push({ graduadosApprovalStatus: ApprovalStatus.approved });
      clause[Op.and].push({ graduatesExpirationDateTime: { [Op.gte]: new Date() } });
    }
    clause[Op.and].push({ targetApplicantType: { [Op.in]: targets } });
    return clause;
  }
};

interface IBuild {
  graduatesStatus?: OfferStatus;
}
