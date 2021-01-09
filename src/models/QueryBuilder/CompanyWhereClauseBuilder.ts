import { Company } from "$models";
import { Op } from "sequelize";
import { NameWhereClause } from "$models/QueryBuilder";
import { Includeable, WhereOptions } from "sequelize/types/lib/model";

export const CompanyWhereClauseBuilder = {
  build: ({ companyName, businessSector }: IBuild): Includeable | undefined => {
    const companyNameClause =
      companyName && NameWhereClause.build({ name: companyName, columnNames: ["companyName"] });
    const businessSectorClause =
      businessSector &&
      NameWhereClause.build({ name: businessSector, columnNames: ["businessSector"] });
    if (!companyNameClause && !businessSectorClause) return;
    const clause: { [Op.and]: WhereOptions[] } = { [Op.and]: [] };
    if (businessSectorClause) clause[Op.and].push(businessSectorClause);
    if (companyNameClause) clause[Op.and].push(companyNameClause);
    return { model: Company, where: clause, attributes: [] };
  }
};

interface IBuild {
  companyName?: string;
  businessSector?: string;
}
