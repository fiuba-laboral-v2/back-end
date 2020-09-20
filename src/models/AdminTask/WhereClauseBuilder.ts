import { ApprovalStatus } from "$models/ApprovalStatus";
import { Secretary } from "$models/Admin";
import { IApprovalStatusOptions } from "$models/AdminTask/Interfaces";
import { IPaginatedInput } from "$graphql/Pagination/Types/GraphQLPaginatedInput";
import { ApplicantType } from "$models/Offer";

export const WhereClauseBuilder = {
  build: ({
    statuses,
    secretary,
    approvalStatusOptions,
    isTargeted,
    updatedBeforeThan
  }: IWhereClauseBuilder) =>
    [
      WhereClauseBuilder.getStatusWhereClause(statuses, secretary, approvalStatusOptions),
      WhereClauseBuilder.getTargetWhereClause(secretary, isTargeted),
      WhereClauseBuilder.getUpdatedAtWhereClause(updatedBeforeThan)
    ]
      .filter(clause => clause)
      .map(clause => `(${clause})`)
      .join(" AND "),
  getUpdatedAtWhereClause: (updatedBeforeThan?: IPaginatedInput) => {
    if (!updatedBeforeThan) return;
    const updatedAtString = updatedBeforeThan.dateTime.toISOString();
    return `
      (
        "AdminTask"."updatedAt" < '${updatedAtString}'
      ) OR (
        "AdminTask"."updatedAt" = '${updatedAtString}'
        AND "AdminTask"."uuid" < '${updatedBeforeThan.uuid}'
      )
    `;
  },
  getTargetWhereClause: (secretary: Secretary, isTargeted: boolean) => {
    if (!isTargeted) return;

    let targetApplicantType: ApplicantType;
    if (secretary === Secretary.graduados) {
      targetApplicantType = ApplicantType.graduate;
    } else {
      targetApplicantType = ApplicantType.student;
    }

    return `
      "AdminTask"."targetApplicantType" = '${ApplicantType.both}' 
      OR "AdminTask"."targetApplicantType" = '${targetApplicantType}'
      OR "AdminTask"."targetApplicantType" IS NULL
    `;
  },
  getStatusWhereClause: (
    statuses: ApprovalStatus[],
    secretary: Secretary,
    { includesSharedApprovalModel, includesSeparateApprovalModel }: IApprovalStatusOptions
  ) => {
    const conditions: string[] = [];
    const columns: string[] = [];
    if (includesSharedApprovalModel) columns.push("approvalStatus");
    if (includesSeparateApprovalModel) {
      columns.push(
        secretary === Secretary.graduados ? "graduadosApprovalStatus" : "extensionApprovalStatus"
      );
    }

    for (const column of columns) {
      for (const status of statuses) {
        conditions.push(`"AdminTask"."${column}" = '${status}'`);
      }
    }
    return conditions.join(" OR ");
  }
};

interface IWhereClauseBuilder {
  statuses: ApprovalStatus[];
  secretary: Secretary;
  approvalStatusOptions: IApprovalStatusOptions;
  isTargeted: boolean;
  updatedBeforeThan?: IPaginatedInput;
}
