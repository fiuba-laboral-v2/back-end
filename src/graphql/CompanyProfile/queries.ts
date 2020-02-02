import { companyProfileType, ICompanyProfile } from "./type";
import { ID, nonNull, List } from "../fieldTypes";
import {
  CompanyProfile,
  CompanyProfileRepository,
  CompanyProfileSerializer
} from "../../models/CompanyProfile";

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
      return companyProfile ? CompanyProfileSerializer.serialize(companyProfile) : null;
    }
  },
  getCompanyProfiles: {
    type: List(companyProfileType),
    resolve: async (): Promise<ICompanyProfile[]> => {
      const companyProfiles: CompanyProfile[] = await CompanyProfileRepository.findAll();
      return companyProfiles.map(companyProfile => {
        return CompanyProfileSerializer.serialize(companyProfile);
      });
    }
  }
};

export default companyProfileQueries;
