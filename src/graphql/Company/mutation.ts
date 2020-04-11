import { GraphQLCompany } from "./Types/GraphQLCompany";
import { Int, List, nonNull, String } from "../fieldTypes";
import { ICompany, CompanyRepository } from "../../models/Company";

const companyMutations = {
  saveCompany: {
    type: GraphQLCompany,
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
    resolve: (_: undefined, args: ICompany) => CompanyRepository.create(args)
  }
};

export default companyMutations;
