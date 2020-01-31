import { companyProfileType } from "./type";
import { ID, nonNull } from "../fieldTypes";
import { CompanyProfile, CompanyProfileRepository } from "../../models/CompanyProfile";

const companyProfileQueries = {
  getCompanyProfileById: {
    type: companyProfileType,
    args: {
      id: {
        type: nonNull(ID)
      }
    },
    resolve: async (_: undefined, { id }: { id: number }) => {
      const companyProfile: CompanyProfile | null = await CompanyProfileRepository.findById(id);
      if (companyProfile) {
        return companyProfile.serialize();
      } else {
        return null;
      }
    }
  },
  getCompanyProfiles: {
    type: companyProfileType,
    resolve: (_: undefined, __: undefined) => {
      return CompanyProfileRepository.findAll();
    }
  }
};

export default companyProfileQueries;
