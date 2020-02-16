import { graphQLCompany } from "./Types/GraphQLCompany";
import { Int, List, nonNull, String } from "../fieldTypes";
import {
  Company,
  CompanyRepository,
  CompanySerializer,
  ICompany
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
    resolve: async (_: undefined, args: ICompany) => {
      const company: Company = await CompanyRepository.create(args);
      return CompanySerializer.serialize(company);
    }
  }
};

export default companyProfileMutations;
