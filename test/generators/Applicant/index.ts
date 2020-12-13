import { IApplicantInputData, withMinimumData } from "./withMinimumData";
import { ApplicantRepository } from "$models/Applicant";
import { IApplicantCareer } from "$models/Applicant/ApplicantCareer";
import { Admin } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { AdminGenerator } from "$generators/Admin";
import { CareerGenerator } from "$generators/Career";

interface IUpdatedWithStatus {
  admin: Admin;
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
      const admin = await AdminGenerator.extension();
      const { code: careerCode } = await CareerGenerator.instance();
      return ApplicantGenerator.instance.updatedWithStatus({
        status: status || ApprovalStatus.approved,
        admin,
        careers: [{ careerCode, isGraduate: false, approvedSubjectCount: 40, currentCareerYear: 5 }]
      });
    },
    graduate: async (status?: ApprovalStatus) => {
      const admin = await AdminGenerator.extension();
      const { code: careerCode } = await CareerGenerator.instance();
      return ApplicantGenerator.instance.updatedWithStatus({
        status: status || ApprovalStatus.approved,
        admin,
        careers: [{ careerCode, isGraduate: true }]
      });
    },
    studentAndGraduate: async (status?: ApprovalStatus) => {
      const admin = await AdminGenerator.extension();
      const firstCareer = await CareerGenerator.instance();
      const secondCareer = await CareerGenerator.instance();
      return ApplicantGenerator.instance.updatedWithStatus({
        status: status || ApprovalStatus.approved,
        admin,
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
