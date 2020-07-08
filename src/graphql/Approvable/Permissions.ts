import { isAdmin } from "../Rules";

export const approvablePermissions = {
  Query: {
    getApprovables: isAdmin
  }
};
