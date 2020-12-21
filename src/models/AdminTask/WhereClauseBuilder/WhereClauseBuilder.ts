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
  build: ({ statuses, secretary, updatedBeforeThan, modelName, tableName }: IWhereClauseBuilder) =>
    [
      StatusWhereClause.build({ statuses, secretary, modelName, tableName }),
      OfferTargetWhereClause.build({ secretary, modelName }),
      ApplicantTypeWhereClause.build({ secretary, modelName }),
      JobApplicationTargetWhereClause.build({ secretary, modelName }),
      UpdatedAtWhereClause.build({ updatedBeforeThan, tableName })
    ]
      .filter(clause => clause)
      .join(" AND ")
};

interface IWhereClauseBuilder {
  statuses: ApprovalStatus[];
  secretary: Secretary;
  updatedBeforeThan?: IPaginatedInput;
  modelName: AdminTaskType;
  tableName: string;
}
