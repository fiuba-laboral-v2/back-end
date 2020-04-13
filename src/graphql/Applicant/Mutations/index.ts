import { saveApplicant } from "./saveApplicant";
import { updateApplicant } from "./updateApplicant";
import { deleteApplicantCapabilities } from "./deleteApplicantCapabilities";
import { deleteApplicantCareers } from "./deleteApplicantCareers";
import { deleteSection } from "./deleteSection";
import { deleteLink } from "./deleteLink";

const applicantMutations = {
  saveApplicant,
  updateApplicant,
  deleteApplicantCapabilities,
  deleteApplicantCareers,
  deleteSection,
  deleteLink
};

export { applicantMutations };
