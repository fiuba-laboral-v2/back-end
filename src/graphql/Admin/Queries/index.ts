import { getAdmins } from "./getAdmins";
import { getCompanyUsersByCompany } from "./getCompanyUsersByCompany";
import { getAdminByUuid } from "./getAdminByUuid";
import { getDeletedAdminByUuid } from "./getDeletedAdminByUuid";

export const adminQueries = {
  getAdmins,
  getCompanyUsersByCompany,
  getAdminByUuid,
  getDeletedAdminByUuid
};
