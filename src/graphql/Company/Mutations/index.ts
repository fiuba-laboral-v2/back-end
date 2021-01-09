import { createCompany } from "./createCompany";
import { updateCurrentCompany } from "./updateCurrentCompany";
import { updateCompanyApprovalStatus } from "./updateCompanyApprovalStatus";
import { updateCompanyCriticalAttributes } from "./updateCompanyCriticalAttributes";

export const companyMutations = {
  createCompany,
  updateCurrentCompany,
  updateCompanyApprovalStatus,
  updateCompanyCriticalAttributes
};
