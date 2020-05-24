import { isUser } from "../rules";

export const capabilitiesPermissions = {
  Query: {
    getCapabilities: isUser
  }
};
