import { withMinimumData } from "./withMinimumData";
import { ApplicantRepository } from "$models/Applicant";
import { Admin } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";

interface IUpdatedWithStatus {
  admin: Admin;
  status: ApprovalStatus;
}

export const ApplicantGenerator = {
  index: 0,
  getIndex: () => {
    ApplicantGenerator.index += 1;
    return ApplicantGenerator.index;
  },
  instance: {
    withMinimumData: () =>
      ApplicantRepository.create(withMinimumData(ApplicantGenerator.getIndex())),
    updatedWithStatus: async (variables?: IUpdatedWithStatus) => {
      const applicant = await ApplicantRepository.create(
        withMinimumData(ApplicantGenerator.getIndex())
      );
      if (!variables) return applicant;
      const { admin, status } = variables;
      return ApplicantRepository.updateApprovalStatus(admin.userUuid, applicant.uuid, status);
    }
  },
  data: {
    minimum: () => withMinimumData(ApplicantGenerator.getIndex())
  }
};
