import { saveAdmin } from "./saveAdmin";
import { updateAdmin } from "./updateAdmin";
import { deactivateAdminAccount } from "./deactivateAdminAccount";
import { activateAdminAccount } from "./activateAdminAccount";

export const adminMutations = {
  saveAdmin,
  updateAdmin,
  deactivateAdminAccount,
  activateAdminAccount
};
