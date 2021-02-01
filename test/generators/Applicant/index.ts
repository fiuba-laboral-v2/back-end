import { IApplicantInputData, withMinimumData } from "./withMinimumData";
import { ApplicantRepository } from "$models/Applicant";
import { ApplicantCareersRepository, IApplicantCareer } from "$models/Applicant/ApplicantCareer";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { CareerGenerator } from "$generators/Career";
import { User, UserRepository } from "$models/User";
import { FiubaCredentials } from "$models/User/Credentials";
import { Applicant, Career } from "$models";
import { ApplicantCapabilityRepository } from "$models/ApplicantCapability";
import { ISaveApplicant } from "$graphql/Applicant/Mutations/saveApplicant";

interface IUpdatedWithStatus {
  status: ApprovalStatus;
  careers?: IApplicantCareer[];
}

interface IApplicantWithOneCareer {
  status?: ApprovalStatus;
  career?: Career;
}

interface IApplicantWithTwoCareer {
  status?: ApprovalStatus;
  careerInProgress?: Career;
  finishedCareer?: Career;
}

const createApplicant = async (attributes: ISaveApplicant) => {
  const { dni, ...userAttributes } = attributes.user;
  const { padron, description, careers, capabilities } = attributes;
  const user = new User({ ...userAttributes, credentials: new FiubaCredentials(dni) });
  await UserRepository.save(user);
  const applicant = new Applicant({ padron, description, userUuid: user.uuid });
  await ApplicantRepository.save(applicant);
  await ApplicantCareersRepository.bulkCreate(careers, applicant);
  await ApplicantCapabilityRepository.update(capabilities || [], applicant);
  return applicant;
};

export const ApplicantGenerator = {
  index: 0,
  getIndex: () => {
    ApplicantGenerator.index += 1;
    return ApplicantGenerator.index;
  },
  instance: {
    withMinimumData: async (variables?: IApplicantInputData) => {
      const attributes = withMinimumData({ index: ApplicantGenerator.getIndex(), ...variables });
      return createApplicant(attributes);
    },
    student: async ({ status, career }: IApplicantWithOneCareer = {}) => {
      const { code: careerCode } = career || (await CareerGenerator.instance());
      return ApplicantGenerator.instance.updatedWithStatus({
        status: status || ApprovalStatus.approved,
        careers: [{ careerCode, isGraduate: false, approvedSubjectCount: 40, currentCareerYear: 5 }]
      });
    },
    graduate: async ({ status, career }: IApplicantWithOneCareer = {}) => {
      const { code: careerCode } = career || (await CareerGenerator.instance());
      return ApplicantGenerator.instance.updatedWithStatus({
        status: status || ApprovalStatus.approved,
        careers: [{ careerCode, isGraduate: true }]
      });
    },
    studentAndGraduate: async ({
      status,
      careerInProgress,
      finishedCareer
    }: IApplicantWithTwoCareer = {}) => {
      const firstCareer = careerInProgress || (await CareerGenerator.instance());
      const secondCareer = finishedCareer || (await CareerGenerator.instance());
      return ApplicantGenerator.instance.updatedWithStatus({
        status: status || ApprovalStatus.approved,
        careers: [
          {
            careerCode: firstCareer.code,
            isGraduate: false,
            approvedSubjectCount: 40,
            currentCareerYear: 5
          },
          { careerCode: secondCareer.code, isGraduate: true }
        ]
      });
    },
    updatedWithStatus: async (variables?: IUpdatedWithStatus) => {
      const index = ApplicantGenerator.getIndex();
      const attributes = withMinimumData({ index, careers: variables?.careers });
      const applicant = await createApplicant(attributes);
      if (!variables) return applicant;
      applicant.set({ approvalStatus: variables.status });
      await ApplicantRepository.save(applicant);
      return applicant;
    }
  },
  data: {
    minimum: () => withMinimumData({ index: ApplicantGenerator.getIndex() })
  }
};
