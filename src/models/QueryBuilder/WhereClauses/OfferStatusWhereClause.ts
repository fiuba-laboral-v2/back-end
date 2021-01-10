import { Op } from "sequelize";
import { WhereOptions } from "sequelize/types/lib/model";
import { OfferStatus } from "$models/Offer";
import { StudentsOfferStatusWhereClause } from "./StudentsOfferStatusWhereClause";
import { GraduatesOfferStatusWhereClause } from "./GraduatesOfferStatusWhereClause";

export const OfferStatusWhereClause = {
  build: ({ studentsStatus, graduatesStatus }: IBuild): WhereOptions | undefined => {
    if (!studentsStatus && !graduatesStatus) return;
    const clause: { [Op.and]: WhereOptions[] } = { [Op.and]: [] };
    const studentsClause = StudentsOfferStatusWhereClause.build({ studentsStatus });
    const graduatesClause = GraduatesOfferStatusWhereClause.build({ graduatesStatus });
    if (studentsClause) clause[Op.and].push(studentsClause);
    if (graduatesClause) clause[Op.and].push(graduatesClause);
    return clause;
  }
};

interface IBuild {
  studentsStatus?: OfferStatus;
  graduatesStatus?: OfferStatus;
}
