import { IApplicantInputData, withMinimumData } from "./withMinimumData";
import { ApplicantRepository } from "$models/Applicant";
import { IApplicantCareer } from "$models/Applicant/ApplicantCareer";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { CareerGenerator } from "$generators/Career";

interface IUpdatedWithStatus {
  status: ApprovalStatus;
  careers?: IApplicantCareer[];
}

export const ApplicantGenerator = {
  index: 0,
  getIndex: () => {
    ApplicantGenerator.index += 1;
    return ApplicantGenerator.index;
  },
  instance: {
    withMinimumData: (variables?: IApplicantInputData) =>
      ApplicantRepository.create(
        withMinimumData({
          index: ApplicantGenerator.getIndex(),
          ...variables
        })
      ),
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
      const applicant = await ApplicantRepository.create(
        withMinimumData({ index: ApplicantGenerator.getIndex(), careers: variables?.careers })
      );
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
