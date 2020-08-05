import { isUser } from "$graphql/Rules";

export const capabilitiesPermissions = {
  Query: {
    getCapabilities: isUser
  }
};
