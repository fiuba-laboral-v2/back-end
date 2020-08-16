import { isAdmin } from "$graphql/Rules";

export const adminTaskPermissions = {
  Query: {
    getAdminTasks: isAdmin
  }
};
