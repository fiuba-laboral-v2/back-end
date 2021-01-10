import { Applicant } from "$models";
import { UsersIncludeClauseBuilder } from "$models/QueryBuilder";

export const ApplicantWhereClauseBuilder = {
  build: ({ applicantName }: IBuild) => {
    const userClause = UsersIncludeClauseBuilder.build({ name: applicantName });
    if (!userClause) return;
    return { model: Applicant, include: [userClause], attributes: [], required: true };
  }
};

interface IBuild {
  applicantName?: string;
}
