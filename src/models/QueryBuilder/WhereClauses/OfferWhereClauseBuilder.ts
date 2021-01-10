import { NameWhereClause } from "$models/QueryBuilder";
import { Op } from "sequelize";
import { WhereOptions } from "sequelize/types/lib/model";
import { ApprovalStatus } from "$models/ApprovalStatus";

export const OfferWhereClauseBuilder = {
  build: ({ title, approvalStatus }: IBuild): WhereOptions | undefined => {
    const nameClause = title && NameWhereClause.build({ name: title, columnNames: ["title"] });
    if (!nameClause && !approvalStatus) return;
    const clause: { [Op.and]: WhereOptions[] } = { [Op.and]: [] };
    if (nameClause) clause[Op.and].push(nameClause);
    if (approvalStatus) clause[Op.and].push({ approvalStatus });
    return clause;
  }
};

interface IBuild {
  title?: string;
  approvalStatus?: ApprovalStatus;
}
