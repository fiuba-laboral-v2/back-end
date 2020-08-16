import { saveApplicant } from "./saveApplicant";
import { updateCurrentApplicant } from "./updateCurrentApplicant";
import { updateApplicantApprovalStatus } from "./updateApplicantApprovalStatus";

const applicantMutations = {
  saveApplicant,
  updateCurrentApplicant,
  updateApplicantApprovalStatus,
};

export { applicantMutations };
