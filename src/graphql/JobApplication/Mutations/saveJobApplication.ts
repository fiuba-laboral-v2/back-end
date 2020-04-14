import { nonNull, String } from "../../fieldTypes";
import { GraphQLJobApplication } from "../Types/GraphQLJobApplication";
import { JobApplicationRepository } from "../../../models/JobApplication";
import { ApplicantRepository } from "../../../models/Applicant";
import { OfferRepository } from "../../../models/Offer";

export const saveJobApplication = {
  type: GraphQLJobApplication,
  args: {
    offerUuid: {
      type: nonNull(String)
    },
    applicantUuid: {
      type: nonNull(String)
    }
  },
  resolve: async (_: undefined, { offerUuid, applicantUuid }: ISaveJobApplication) => {
    const offer = await OfferRepository.findByUuid(offerUuid);
    const applicant = await ApplicantRepository.findByUuid(applicantUuid);
    await JobApplicationRepository.create(applicant, offer);
    return { applicant, offer };
  }
};

interface ISaveJobApplication {
  offerUuid: string;
  applicantUuid: string;
}
