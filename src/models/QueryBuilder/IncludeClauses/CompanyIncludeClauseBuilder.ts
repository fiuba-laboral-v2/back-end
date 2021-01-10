import { Company } from "$models";
import { CompanyWhereClauseBuilder } from "$models/QueryBuilder";

export const CompanyIncludeClauseBuilder = {
  build: ({ companyName, businessSector }: IBuild) => {
    const where = CompanyWhereClauseBuilder.build({ companyName, businessSector });
    if (!where) return;
    return { model: Company, where, attributes: [] };
  }
};

interface IBuild {
  companyName?: string;
  businessSector?: string;
}
