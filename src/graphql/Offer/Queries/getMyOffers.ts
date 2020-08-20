import { GraphQLOffer } from "../Types/GraphQLOffer";
import { OfferRepository } from "$models/Offer";
import { ICompanyUser } from "src/graphql/Context";
import {
  GraphQLPaginatedInput,
  IPaginatedInput
} from "$graphql/Pagination/Types/GraphQLPaginatedInput";
import { GraphQLPaginatedResults } from "$graphql/Pagination/Types/GraphQLPaginatedResults";

const getMyOffers = {
  type: GraphQLPaginatedResults(GraphQLOffer),
  args: {
    updatedBeforeThan: {
      type: GraphQLPaginatedInput
    }
  },
  resolve: (
    _: undefined,
    { updatedBeforeThan }: { updatedBeforeThan?: IPaginatedInput },
    { currentUser }: { currentUser: ICompanyUser }
  ) => OfferRepository.findAll({ companyUuid: currentUser.company.uuid, updatedBeforeThan })
};

export { getMyOffers };
