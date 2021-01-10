import { NameWhereClause } from "$models/QueryBuilder";
import { Op } from "sequelize";
import { WhereOptions } from "sequelize/types/lib/model";

export const OfferTitleWhereClauseBuilder = {
  build: ({ title }: IBuild): WhereOptions | undefined => {
    const nameClause = title && NameWhereClause.build({ name: title, columnNames: ["title"] });
    if (!nameClause) return;
    const clause: { [Op.and]: WhereOptions[] } = { [Op.and]: [] };
    if (nameClause) clause[Op.and].push(nameClause);
    return clause;
  }
};

interface IBuild {
  title?: string;
}
