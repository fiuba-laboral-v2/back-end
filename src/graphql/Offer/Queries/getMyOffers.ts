import { nonNull, Boolean } from "../../fieldTypes";
import { GraphQLOffer } from "../Types/GraphQLOffer";
import { OfferRepository, OfferStatus } from "$models/Offer";
import {
  GraphQLPaginatedInput,
  IPaginatedInput
} from "$graphql/Pagination/Types/GraphQLPaginatedInput";
import { GraphQLPaginatedResults } from "$graphql/Pagination/Types/GraphQLPaginatedResults";
import { IApolloServerContext } from "$graphql/Context";

export const getMyOffers = {
  type: GraphQLPaginatedResults(GraphQLOffer),
  args: {
    updatedBeforeThan: {
      type: GraphQLPaginatedInput
    },
    hideRejectedAndExpiredOffers: {
      type: nonNull(Boolean)
    }
  },
  resolve: (
    _: undefined,
    { updatedBeforeThan, hideRejectedAndExpiredOffers }: IGetMyOffers,
    { currentUser }: IApolloServerContext
  ) => {
    const statuses: OfferStatus[] = [];
    if (hideRejectedAndExpiredOffers) statuses.push(OfferStatus.approved, OfferStatus.pending);

    return OfferRepository.findLatestByCompany({
      companyUuid: currentUser.getCompanyRole().companyUuid,
      updatedBeforeThan,
      statuses
    });
  }
};

export interface IGetMyOffers {
  updatedBeforeThan?: IPaginatedInput;
  hideRejectedAndExpiredOffers: boolean;
}
