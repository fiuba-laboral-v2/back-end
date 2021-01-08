import { Offer } from "$models";
import { NameWhereClause } from "$models/QueryBuilder";
import { Includeable } from "sequelize/types/lib/model";

export const OfferWhereClauseBuilder = {
  build: ({ title }: IBuild): Includeable | undefined => {
    if (title === undefined) return;
    const whereClause = NameWhereClause.build({ name: title, columnNames: ["title"] });
    if (!whereClause) return;
    return { model: Offer, where: whereClause, attributes: [] };
  }
};

interface IBuild {
  title?: string;
}
