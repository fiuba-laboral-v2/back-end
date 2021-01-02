import { saveApplicant } from "./saveApplicant";
import { updateCurrentApplicant } from "./updateCurrentApplicant";
import { updateApplicantApprovalStatus } from "./updateApplicantApprovalStatus";
import { updatePadron } from "./updatePadron";

export const applicantMutations = {
  saveApplicant,
  updateCurrentApplicant,
  updateApplicantApprovalStatus,
  updatePadron
};
