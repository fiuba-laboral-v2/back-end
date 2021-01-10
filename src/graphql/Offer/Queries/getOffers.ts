import { String } from "$graphql/fieldTypes";
import { OfferRepository } from "$models/Offer";
import { GraphQLPaginatedResults } from "$graphql/Pagination/Types/GraphQLPaginatedResults";
import { GraphQLApprovalStatus } from "$graphql/ApprovalStatus/Types/GraphQLApprovalStatus";
import { GraphQLOffer } from "$graphql/Offer/Types/GraphQLOffer";
import {
  GraphQLPaginatedInput,
  IPaginatedInput
} from "$graphql/Pagination/Types/GraphQLPaginatedInput";
import { ApprovalStatus } from "$models/ApprovalStatus";

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
    approvalStatus: {
      type: GraphQLApprovalStatus
    },
    title: {
      type: String
    }
  },
  resolve: (_: undefined, filter: IGetOffers) => OfferRepository.findAll(filter)
};

export interface IGetOffers {
  updatedBeforeThan?: IPaginatedInput;
  companyName?: string;
  businessSector?: string;
  title?: string;
  approvalStatus?: ApprovalStatus;
  careerCodes?: string[];
}
