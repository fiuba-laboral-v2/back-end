import { GraphQLOffer } from "../Types/GraphQLOffer";
import { OfferRepository, IFindLatestByCompany } from "$models/Offer";
import { GraphQLPaginatedInput } from "$graphql/Pagination/Types/GraphQLPaginatedInput";
import { GraphQLPaginatedResults } from "$graphql/Pagination/Types/GraphQLPaginatedResults";
import { IApolloServerContext } from "$graphql/Context";

export const getMyOffers = {
  type: GraphQLPaginatedResults(GraphQLOffer),
  args: {
    updatedBeforeThan: {
      type: GraphQLPaginatedInput
    }
  },
  resolve: (
    _: undefined,
    { updatedBeforeThan }: IFindLatestByCompany,
    { currentUser }: IApolloServerContext
  ) =>
    OfferRepository.findLatestByCompany({
      companyUuid: currentUser.getCompanyRole().companyUuid,
      updatedBeforeThan,
      statuses: []
    })
};
