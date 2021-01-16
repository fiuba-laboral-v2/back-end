import { List, String } from "$graphql/fieldTypes";
import { OfferRepository, OfferStatus } from "$models/Offer";
import { GraphQLPaginatedResults } from "$graphql/Pagination/Types/GraphQLPaginatedResults";
import { GraphQLOffer } from "$graphql/Offer/Types/GraphQLOffer";
import { GraphQLOfferStatus } from "$graphql/Offer/Types/GraphQLOfferStatus";
import {
  GraphQLPaginatedInput,
  IPaginatedInput
} from "$graphql/Pagination/Types/GraphQLPaginatedInput";

export const getOffers = {
  type: GraphQLPaginatedResults(GraphQLOffer),
  args: {
    updatedBeforeThan: {
      type: GraphQLPaginatedInput
    },
    companyName: {
      type: String
    },
    businessSector: {
      type: String
    },
    studentsStatus: {
      type: GraphQLOfferStatus
    },
    graduatesStatus: {
      type: GraphQLOfferStatus
    },
    title: {
      type: String
    },
    careerCodes: {
      type: List(String)
    }
  },
  resolve: (_: undefined, filter: IGetOffers) => OfferRepository.findAll(filter)
};

export interface IGetOffers {
  updatedBeforeThan?: IPaginatedInput;
  companyName?: string;
  businessSector?: string;
  title?: string;
  studentsStatus?: OfferStatus;
  graduatesStatus?: OfferStatus;
  careerCodes?: string[];
}
