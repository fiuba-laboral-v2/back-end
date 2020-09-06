import { withObligatoryData } from "./withObligatoryData";
import { withOneSection } from "./withOneSection";
import { OfferRepository, TargetApplicantType } from "$models/Offer";
import { Admin } from "$models";
import { IOfferCareer } from "$models/Offer/OfferCareer";
import { IOfferSection } from "$models/Offer/OfferSection";
import { ApprovalStatus } from "$models/ApprovalStatus";

export interface IOfferInput {
  companyUuid: string;
  careers?: IOfferCareer[];
  sections?: IOfferSection[];
  targetApplicantType?: TargetApplicantType;
}

interface IUpdatedWithStatus {
  status: ApprovalStatus;
  admin: Admin;
}

export const OfferGenerator = {
  index: 0,
  getIndex: () => {
    OfferGenerator.index += 1;
    return OfferGenerator.index;
  },
  instance: {
    withObligatoryData: (variables: IOfferInput) =>
      OfferRepository.create(OfferGenerator.data.withObligatoryData(variables)),
    withOneSection: (variables: IOfferInput) =>
      OfferRepository.create(withOneSection({ index: OfferGenerator.getIndex(), ...variables })),
    updatedWithStatus: async ({
      admin,
      status,
      ...variables
    }: IOfferInput & IUpdatedWithStatus) => {
      const { uuid } = await OfferRepository.create(
        withOneSection({ index: OfferGenerator.getIndex(), ...variables })
      );
      return OfferRepository.updateApprovalStatus({ uuid, admin, status });
    }
  },
  data: {
    withObligatoryData: (variables: IOfferInput) =>
      withObligatoryData({ index: OfferGenerator.getIndex(), ...variables })
  }
};
