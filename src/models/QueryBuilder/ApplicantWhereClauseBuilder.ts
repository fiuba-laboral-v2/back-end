import { Applicant } from "$models";
import { UsersWhereClauseBuilder } from "$models/QueryBuilder";
import { Includeable } from "sequelize/types/lib/model";

export const ApplicantWhereClauseBuilder = {
  build: ({ applicantName }: IBuild): Includeable | undefined => {
    const userClause = UsersWhereClauseBuilder.build({ name: applicantName });
    if (!userClause) return;
    return { model: Applicant, include: [userClause], attributes: [], required: true };
  }
};

interface IBuild {
  applicantName?: string;
}
