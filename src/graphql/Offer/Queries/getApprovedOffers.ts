import { GraphQLOffer } from "../Types/GraphQLOffer";
import { OfferRepository } from "$models/Offer";
import { ApprovalStatus } from "$models/ApprovalStatus";
import {
  GraphQLPaginatedInput,
  IPaginatedInput
} from "$graphql/Pagination/Types/GraphQLPaginatedInput";
import { GraphQLPaginatedResults } from "$graphql/Pagination/Types/GraphQLPaginatedResults";

export const getApprovedOffers = {
  type: GraphQLPaginatedResults(GraphQLOffer),
  args: {
    updatedBeforeThan: {
      type: GraphQLPaginatedInput
    }
  },
  resolve: async (_: undefined, { updatedBeforeThan }: { updatedBeforeThan?: IPaginatedInput }) =>
    OfferRepository.findAll({
      updatedBeforeThan,
      approvalStatuses: {
        graduadosApprovalStatus: ApprovalStatus.approved,
        extensionApprovalStatus: ApprovalStatus.approved
      }
    })
};
