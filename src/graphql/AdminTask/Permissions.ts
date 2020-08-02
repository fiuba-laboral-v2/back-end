import { isAdmin } from "../Rules";

export const adminTaskPermissions = {
  Query: {
    getAdminTasks: isAdmin
  }
};
