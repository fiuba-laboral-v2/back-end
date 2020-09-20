import { nonNull, String } from "$graphql/fieldTypes";
import { GraphQLJobApplication } from "../Types/GraphQLJobApplication";
import { JobApplicationRepository } from "$models/JobApplication";
import { OfferRepository } from "$models/Offer";
import { ApplicantRepository } from "$models/Applicant";
import { CurrentUser } from "$models/CurrentUser";

export const saveJobApplication = {
  type: GraphQLJobApplication,
  args: {
    offerUuid: {
      type: nonNull(String)
    }
  },
  resolve: async (
    _: undefined,
    { offerUuid }: { offerUuid: string },
    { currentUser }: { currentUser: CurrentUser }
  ) => {
    const offer = await OfferRepository.findByUuid(offerUuid);
    const applicant = await ApplicantRepository.findByUuid(
      currentUser.getApplicant().applicantUuid
    );
    return JobApplicationRepository.apply(applicant, offer);
  }
};
