import { GraphQLPaginatedResults } from "$graphql/Pagination/Types/GraphQLPaginatedResults";
import { GraphQLCompanyNotification } from "../Types/GraphQLCompanyNotification";
import { CompanyNotificationRepository } from "$models/CompanyNotification";
import {
  GraphQLPaginatedInput,
  IPaginatedInput
} from "$graphql/Pagination/Types/GraphQLPaginatedInput";
import { IApolloServerContext } from "$graphql/Context";

export const getCompanyNotifications = {
  type: GraphQLPaginatedResults(GraphQLCompanyNotification),
  args: {
    updatedBeforeThan: {
      type: GraphQLPaginatedInput
    }
  },
  resolve: async (
    _: undefined,
    { updatedBeforeThan }: { updatedBeforeThan?: IPaginatedInput },
    { currentUser }: IApolloServerContext
  ) =>
    CompanyNotificationRepository.findLatestByCompany({
      updatedBeforeThan,
      companyUuid: currentUser.getCompany().companyUuid
    })
};
