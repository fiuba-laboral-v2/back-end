import { withObligatoryData } from "./withObligatoryData";
import { withOneSection } from "./withOneSection";
import { AdminGenerator } from "$generators/Admin";
import { OfferRepository } from "$models/Offer";
import { ApplicantType } from "$models/Applicant";
import { Admin, Offer } from "$models";
import { IOfferCareer } from "$models/Offer/OfferCareer";
import { IOfferSection } from "$models/Offer/OfferSection";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Secretary } from "$models/Admin";

export interface IOfferInput {
  companyUuid: string;
  careers?: IOfferCareer[];
  sections?: IOfferSection[];
  targetApplicantType?: ApplicantType;
}

interface IUpdatedWithStatus {
  status: ApprovalStatus;
  admin: Admin;
}

export interface IForAllTargets {
  [ApplicantType.student]: Offer;
  [ApplicantType.graduate]: Offer;
  [ApplicantType.both]: Offer;
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
    },
    forStudents: async (variables: IOfferInput) => {
      const admin = await AdminGenerator.instance({ secretary: Secretary.extension });
      return OfferGenerator.instance.updatedWithStatus({
        status: ApprovalStatus.approved,
        admin,
        targetApplicantType: ApplicantType.student,
        ...variables
      });
    },
    forGraduates: async (variables: IOfferInput) => {
      const admin = await AdminGenerator.instance({ secretary: Secretary.graduados });
      return OfferGenerator.instance.updatedWithStatus({
        status: ApprovalStatus.approved,
        admin,
        targetApplicantType: ApplicantType.graduate,
        ...variables
      });
    },
    forStudentsAndGraduates: async (variables: IOfferInput) => {
      const extensionAdmin = await AdminGenerator.instance({ secretary: Secretary.extension });
      const graduadosAdmin = await AdminGenerator.instance({ secretary: Secretary.graduados });
      const { uuid } = await OfferGenerator.instance.updatedWithStatus({
        status: ApprovalStatus.approved,
        admin: extensionAdmin,
        targetApplicantType: ApplicantType.both,
        ...variables
      });
      return OfferRepository.updateApprovalStatus({
        uuid,
        admin: graduadosAdmin,
        status: ApprovalStatus.approved
      });
    },
    forAllTargets: async (variables: IOfferInput): Promise<IForAllTargets> => ({
      [ApplicantType.student]: await OfferGenerator.instance.forStudents(variables),
      [ApplicantType.graduate]: await OfferGenerator.instance.forGraduates(variables),
      [ApplicantType.both]: await OfferGenerator.instance.forStudentsAndGraduates(variables)
    })
  },
  data: {
    withObligatoryData: (variables: IOfferInput) =>
      withObligatoryData({ index: OfferGenerator.getIndex(), ...variables })
  }
};
