import { companyProfileType, ICompanyProfile } from "./type";
import { ID, nonNull, List } from "../fieldTypes";
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
    type: List(companyProfileType),
    resolve: async (_: undefined, __: undefined): Promise<ICompanyProfile[]> => {
      const companyProfiles: CompanyProfile[] = await CompanyProfileRepository.findAll();
      return companyProfiles.map(companyProfile => {
        return companyProfile.serialize();
      });
    }
  }
};

export default companyProfileQueries;
