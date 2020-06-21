import { isUser } from "../Rules";

export const capabilitiesPermissions = {
  Query: {
    getCapabilities: isUser
  }
};
