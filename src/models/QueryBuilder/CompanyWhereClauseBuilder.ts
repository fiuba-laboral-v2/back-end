import { Company } from "$models";
import { NameWhereClause } from "$models/QueryBuilder";
import { Includeable } from "sequelize/types/lib/model";

export const CompanyWhereClauseBuilder = {
  build: ({ companyName: name }: IBuild): Includeable | undefined => {
    if (name === undefined) return;
    const whereClause = NameWhereClause.build({ name, columnNames: ["companyName"] });
    if (!whereClause) return;
    return { model: Company, where: whereClause, attributes: [] };
  }
};

interface IBuild {
  companyName?: string;
}
