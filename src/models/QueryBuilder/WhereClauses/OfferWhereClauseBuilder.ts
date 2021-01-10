import { NameWhereClause } from "$models/QueryBuilder";
import { WhereOptions } from "sequelize/types/lib/model";

export const OfferWhereClauseBuilder = {
  build: ({ title }: IBuild): WhereOptions | undefined => {
    if (title === undefined) return;
    const nameClause = title && NameWhereClause.build({ name: title, columnNames: ["title"] });
    if (!nameClause) return;
    return nameClause;
  }
};

interface IBuild {
  title?: string;
}
