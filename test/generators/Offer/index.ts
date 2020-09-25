import { withObligatoryData } from "./withObligatoryData";
import { withOneSection } from "./withOneSection";
import { AdminGenerator } from "$generators/Admin";
import { OfferRepository } from "$models/Offer";
import { ApplicantType } from "$models/Applicant";
import { Admin, Offer } from "$models";
import { IOfferCareer } from "$models/Offer/OfferCareer";
import { IOfferSection } from "$models/Offer/OfferSection";
import { ApprovalStatus } from "$models/ApprovalStatus";

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

interface IOfferByStatus {
  [ApprovalStatus.pending]: Offer;
  [ApprovalStatus.approved]: Offer;
  [ApprovalStatus.rejected]: Offer;
}

export interface IForAllTargetsAndStatuses {
  [ApplicantType.student]: IOfferByStatus;
  [ApplicantType.graduate]: IOfferByStatus;
  [ApplicantType.both]: IOfferByStatus;
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
    forStudents: async ({ status, ...variables }: IOfferInput & { status?: ApprovalStatus }) => {
      const admin = await AdminGenerator.extension();
      return OfferGenerator.instance.updatedWithStatus({
        status: status || ApprovalStatus.approved,
        admin,
        targetApplicantType: ApplicantType.student,
        ...variables
      });
    },
    forGraduates: async ({ status, ...variables }: IOfferInput & { status?: ApprovalStatus }) => {
      const admin = await AdminGenerator.graduados();
      return OfferGenerator.instance.updatedWithStatus({
        status: status || ApprovalStatus.approved,
        admin,
        targetApplicantType: ApplicantType.graduate,
        ...variables
      });
    },
    forStudentsAndGraduates: async ({
      status,
      ...variables
    }: IOfferInput & { status?: ApprovalStatus }) => {
      const extensionAdmin = await AdminGenerator.extension();
      const graduadosAdmin = await AdminGenerator.graduados();
      const { uuid } = await OfferGenerator.instance.updatedWithStatus({
        status: status || ApprovalStatus.approved,
        admin: extensionAdmin,
        targetApplicantType: ApplicantType.both,
        ...variables
      });
      return OfferRepository.updateApprovalStatus({
        uuid,
        admin: graduadosAdmin,
        status: status || ApprovalStatus.approved
      });
    },
    forAllTargets: async (variables: IOfferInput): Promise<IForAllTargets> => ({
      [ApplicantType.student]: await OfferGenerator.instance.forStudents(variables),
      [ApplicantType.graduate]: await OfferGenerator.instance.forGraduates(variables),
      [ApplicantType.both]: await OfferGenerator.instance.forStudentsAndGraduates(variables)
    }),
    forAllTargetsAndStatuses: async (
      variables: IOfferInput
    ): Promise<IForAllTargetsAndStatuses> => {
      const pending = ApprovalStatus.pending;
      const approved = ApprovalStatus.approved;
      const rejected = ApprovalStatus.rejected;
      const forStudents = OfferGenerator.instance.forStudents;
      const forGraduates = OfferGenerator.instance.forGraduates;
      const forStudentsAndGraduates = OfferGenerator.instance.forStudentsAndGraduates;
      return {
        [ApplicantType.student]: {
          [ApprovalStatus.pending]: await forStudents({ ...variables, status: pending }),
          [ApprovalStatus.approved]: await forStudents({ ...variables, status: approved }),
          [ApprovalStatus.rejected]: await forStudents({ ...variables, status: rejected })
        },
        [ApplicantType.graduate]: {
          [ApprovalStatus.pending]: await forGraduates({ ...variables, status: pending }),
          [ApprovalStatus.approved]: await forGraduates({ ...variables, status: approved }),
          [ApprovalStatus.rejected]: await forGraduates({ ...variables, status: rejected })
        },
        [ApplicantType.both]: {
          [ApprovalStatus.pending]: await forStudentsAndGraduates({
            ...variables,
            status: pending
          }),
          [ApprovalStatus.approved]: await forStudentsAndGraduates({
            ...variables,
            status: approved
          }),
          [ApprovalStatus.rejected]: await forStudentsAndGraduates({
            ...variables,
            status: rejected
          })
        }
      };
    }
  },
  data: {
    withObligatoryData: (variables: IOfferInput) =>
      withObligatoryData({ index: OfferGenerator.getIndex(), ...variables })
  }
};
