import { nonNull, String } from "../../fieldTypes";
import { GraphQLJobApplication } from "../Types/GraphQLJobApplication";
import { JobApplicationRepository } from "../../../models/JobApplication";
import { OfferRepository } from "../../../models/Offer";
import { UserRepository } from "../../../models/User";
import { IApolloServerContext } from "../../../server";
import { AuthenticationError, ForbiddenError } from "apollo-server-errors";

export const saveJobApplication = {
  type: GraphQLJobApplication,
  args: {
    offerUuid: {
      type: nonNull(String)
    }
  },
  resolve: async (
    _: undefined,
    { offerUuid }: { offerUuid: string; },
    { currentUser }: IApolloServerContext
  ) => {
    if (!currentUser) throw new AuthenticationError("You are not authenticated");

    const user = await UserRepository.findByEmail(currentUser?.email);
    const applicant = await user.getApplicant();
    if (!applicant) throw new ForbiddenError("You are not an applicant");

    const offer = await OfferRepository.findByUuid(offerUuid);
    await JobApplicationRepository.apply(applicant, offer);
    return { applicant, offer };
  }
};
