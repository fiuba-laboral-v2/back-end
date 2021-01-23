import { getAdmins } from "./getAdmins";
import { getCompanyUsersByCompany } from "./getCompanyUsersByCompany";
import { getAdminByUuid } from "./getAdminByUuid";
import { getDeletedAdminByUuid } from "./getDeletedAdminByUuid";
import { getStatistics } from "./getStatistics";

export const adminQueries = {
  getAdmins,
  getCompanyUsersByCompany,
  getAdminByUuid,
  getDeletedAdminByUuid,
  getStatistics
};
