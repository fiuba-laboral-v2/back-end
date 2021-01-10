import { Offer } from "$models";
import { NameWhereClause, CompanyWhereClauseBuilder } from "$models/QueryBuilder";
import { Includeable } from "sequelize/types/lib/model";

export const OfferWhereClauseBuilder = {
  build: ({ title, companyName }: IBuild) => {
    if (title === undefined && companyName === undefined) return;
    const nameClause = title && NameWhereClause.build({ name: title, columnNames: ["title"] });
    const companyClause = CompanyWhereClauseBuilder.build({ companyName });
    if (!nameClause && !companyClause) return;

    let clause: Includeable = { model: Offer, attributes: [] };
    if (nameClause) clause = { ...clause, where: nameClause };
    if (companyClause) clause = { ...clause, required: true, include: [companyClause] };
    return clause;
  }
};

interface IBuild {
  title?: string;
  companyName?: string;
}
