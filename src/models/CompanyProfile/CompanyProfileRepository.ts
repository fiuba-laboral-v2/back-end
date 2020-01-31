import { CompanyProfile } from "./index";

export const CompanyProfileRepository = {
  save: async (companyProfile: CompanyProfile) => {
    return companyProfile.save();
  },
  findById: async (id: number) => {
    return CompanyProfile.findOne({ where: { id: id } });
  },
  findAll: async () => {
    return CompanyProfile.findAll({});
  },
  truncate: async () => {
    return CompanyProfile.destroy({ truncate: true });
  }
};
