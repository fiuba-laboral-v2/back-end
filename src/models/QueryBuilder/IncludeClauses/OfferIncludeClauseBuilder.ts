import { Offer } from "$models";
import { OfferWhereClauseBuilder, CompanyWhereClauseBuilder } from "$models/QueryBuilder";
import { Includeable } from "sequelize/types/lib/model";

export const OfferIncludeClauseBuilder = {
  build: ({ title, companyName }: IBuild) => {
    const where = OfferWhereClauseBuilder.build({ title });
    const companyClause = CompanyWhereClauseBuilder.build({ companyName });
    if (!where && !companyClause) return;

    let clause: Includeable = { model: Offer, attributes: [] };
    if (where) clause = { ...clause, where };
    if (companyClause) clause = { ...clause, required: true, include: [companyClause] };
    return clause;
  }
};

interface IBuild {
  title?: string;
  companyName?: string;
}
