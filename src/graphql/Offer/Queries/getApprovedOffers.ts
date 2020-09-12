import { GraphQLOffer } from "../Types/GraphQLOffer";
import { OfferRepository } from "$models/Offer";
import { ApplicantRepository } from "$models/Applicant";
import {
  GraphQLPaginatedInput,
  IPaginatedInput
} from "$graphql/Pagination/Types/GraphQLPaginatedInput";
import { IApplicantUser } from "$graphql/Context";
import { GraphQLPaginatedResults } from "$graphql/Pagination/Types/GraphQLPaginatedResults";

export const getApprovedOffers = {
  type: GraphQLPaginatedResults(GraphQLOffer),
  args: {
    updatedBeforeThan: {
      type: GraphQLPaginatedInput
    }
  },
  resolve: async (
    _: undefined,
    { updatedBeforeThan }: { updatedBeforeThan?: IPaginatedInput },
    { currentUser }: { currentUser: IApplicantUser }
  ) => {
    const applicant = await ApplicantRepository.findByUuid(currentUser.applicant.uuid);
    const applicantType = await applicant.getType();
    return OfferRepository.findAll({
      updatedBeforeThan,
      applicantType
    });
  }
};
