import { List, nonNull, String } from "../../fieldTypes";
import { CompanyRepository, ICompany } from "../../../models/Company";
import { GraphQLCompany } from "../Types/GraphQLCompany";

export const createCompany = {
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
      type: List(String)
    },
    photos: {
      type: List(String)
    }
  },
  resolve: (_: undefined, args: ICompany) => CompanyRepository.create(args)
};
