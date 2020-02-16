import { graphQLCompany } from "./Types/GraphQLCompany";
import { Int, List, nonNull, String } from "../fieldTypes";
import {
  CompanyProfile,
  CompanyProfileRepository,
  CompanyProfileSerializer,
  ICompanyProfile
} from "../../models/Company";

const companyProfileMutations = {
  saveCompanyProfile: {
    type: graphQLCompany,
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
      website: {
        type: String
      },
      email: {
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
      const companyProfile: CompanyProfile = await CompanyProfileRepository.create(args);
      return CompanyProfileSerializer.serialize(companyProfile);
    }
  }
};

export default companyProfileMutations;
