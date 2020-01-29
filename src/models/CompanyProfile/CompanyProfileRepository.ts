import { CompanyProfile } from "./index";

export const CompanyProfileRepository = {
  save: async (companyProfile: CompanyProfile) => {
    return companyProfile.save();
  },
  truncate: async () => {
    return CompanyProfile.destroy({ truncate: true });
  }
};
