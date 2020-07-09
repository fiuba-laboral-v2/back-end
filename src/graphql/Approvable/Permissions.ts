import { isAdmin } from "../Rules";

export const approvablePermissions = {
  Query: {
    getAdminTasks: isAdmin
  }
};
