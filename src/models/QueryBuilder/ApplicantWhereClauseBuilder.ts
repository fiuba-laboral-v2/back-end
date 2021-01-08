import { UserSequelizeModel, Applicant } from "$models";
import { NameWhereClause } from "$models/QueryBuilder/index";
import { Includeable } from "sequelize/types/lib/model";

export const ApplicantWhereClauseBuilder = {
  build: ({ applicantName }: IBuild): Includeable | undefined => {
    if (applicantName === undefined) return;
    const where = NameWhereClause.build({ name: applicantName, columnNames: ["name", "surname"] });
    if (!where) return;
    return {
      model: Applicant,
      include: [
        {
          model: UserSequelizeModel,
          where,
          attributes: []
        }
      ],
      attributes: []
    };
  }
};

interface IBuild {
  applicantName?: string;
}
