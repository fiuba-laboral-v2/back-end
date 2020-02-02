import { companyProfileType, ICompanyProfile } from "./type";
import { Int, List, nonNull, String } from "../fieldTypes";
import {
  CompanyProfile,
  CompanyProfileRepository,
  CompanyProfileSerializer
} from "../../models/CompanyProfile";

const companyProfileMutations = {
  saveCompanyProfile: {
    type: companyProfileType,
    args: {
      cuit: {
        type: nonNull(String)
      },
      companyName: {
        type: nonNull(String)
      },
      slogan: {
        type: String
      },
      description: {
        type: String
      },
      logo: {
        type: String
      },
      phoneNumbers: {
        type: List(Int)
      },
      photos: {
        type: List(String)
      }
    },
    resolve: async (_: undefined, args: ICompanyProfile) => {
      const companyProfile: CompanyProfile =  await CompanyProfileRepository.create(args);
      return CompanyProfileSerializer.serialize(companyProfile);
    }
  }
};

export default companyProfileMutations;
