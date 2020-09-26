import { ApprovalStatus } from "$models/ApprovalStatus";
import { Secretary } from "$models/Admin";
import { IPaginatedInput } from "$graphql/Pagination/Types/GraphQLPaginatedInput";
import { AdminTaskType } from "$models/AdminTask/Model";
import { StatusWhereClause } from "./Status";
import { OfferTargetWhereClause } from "./OfferTarget";
import { ApplicantTypeWhereClause } from "./ApplicantType";
import { JobApplicationTargetWhereClause } from "./JobApplicationTarget";
import { UpdatedAtWhereClause } from "./UpdatedAt";

export const WhereClauseBuilder = {
  build: ({ statuses, secretary, adminTaskTypes, updatedBeforeThan }: IWhereClauseBuilder) =>
    [
      StatusWhereClause.build({ statuses, secretary, adminTaskTypes }),
      OfferTargetWhereClause.build({ secretary, adminTaskTypes }),
      ApplicantTypeWhereClause.build({ secretary, adminTaskTypes }),
      JobApplicationTargetWhereClause.build({ secretary, adminTaskTypes }),
      UpdatedAtWhereClause.build(updatedBeforeThan)
    ]
      .filter(clause => clause)
      .join(" AND ")
};

interface IWhereClauseBuilder {
  statuses: ApprovalStatus[];
  secretary: Secretary;
  adminTaskTypes: AdminTaskType[];
  updatedBeforeThan?: IPaginatedInput;
}
