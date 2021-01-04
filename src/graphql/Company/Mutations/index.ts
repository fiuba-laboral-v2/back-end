import { createCompany } from "./createCompany";
import { updateCurrentCompany } from "./updateCurrentCompany";
import { updateCompanyApprovalStatus } from "./updateCompanyApprovalStatus";
import { updateCuitAndBusinessName } from "./updateCuitAndBusinessName";

export const companyMutations = {
  createCompany,
  updateCurrentCompany,
  updateCompanyApprovalStatus,
  updateCuitAndBusinessName
};
