import { IApplicantInputData, withMinimumData } from "./withMinimumData";
import { ApplicantRepository, ISaveApplicant } from "$models/Applicant";
import { ApplicantCareersRepository, IApplicantCareer } from "$models/Applicant/ApplicantCareer";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { CareerGenerator } from "$generators/Career";
import { FiubaCredentials, User, UserRepository } from "$models/User";
import { Applicant } from "$models";
import { ApplicantCapabilityRepository } from "$models/ApplicantCapability";

interface IUpdatedWithStatus {
  status: ApprovalStatus;
  careers?: IApplicantCareer[];
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
    student: async (status?: ApprovalStatus) => {
      const { code: careerCode } = await CareerGenerator.instance();
      return ApplicantGenerator.instance.updatedWithStatus({
        status: status || ApprovalStatus.approved,
        careers: [{ careerCode, isGraduate: false, approvedSubjectCount: 40, currentCareerYear: 5 }]
      });
    },
    graduate: async (status?: ApprovalStatus) => {
      const { code: careerCode } = await CareerGenerator.instance();
      return ApplicantGenerator.instance.updatedWithStatus({
        status: status || ApprovalStatus.approved,
        careers: [{ careerCode, isGraduate: true }]
      });
    },
    studentAndGraduate: async (status?: ApprovalStatus) => {
      const firstCareer = await CareerGenerator.instance();
      const secondCareer = await CareerGenerator.instance();
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
