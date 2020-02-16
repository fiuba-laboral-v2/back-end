import { graphQLCompany } from "./Types/GraphQLCompany";
import { ID, nonNull, List } from "../fieldTypes";
import {
  CompanyProfile,
  CompanyProfileRepository,
  CompanyProfileSerializer,
  ICompanyProfile
} from "../../models/Company";

const companyProfileQueries = {
  getCompanyProfileById: {
    type: graphQLCompany,
    args: {
      id: {
        type: nonNull(ID)
      }
    },
    resolve: async (_: undefined, { id }: { id: number }) => {
      const companyProfile: CompanyProfile = await CompanyProfileRepository.findById(id);
      return CompanyProfileSerializer.serialize(companyProfile);
    }
  },
  getCompanyProfiles: {
    type: List(graphQLCompany),
    resolve: async (): Promise<ICompanyProfile[]> => {
      const companyProfiles: CompanyProfile[] = await CompanyProfileRepository.findAll();
      return companyProfiles.map(companyProfile => {
        return CompanyProfileSerializer.serialize(companyProfile);
      });
    }
  }
};

export default companyProfileQueries;
