import { isAdmin } from "../Rules";

export const approvablePermissions = {
  Query: {
    getPendingEntities: isAdmin
  }
};
