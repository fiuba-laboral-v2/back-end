import { List, String } from "../../fieldTypes";
import { CompanyRepository, ICompanyEditable } from "../../../models/Company";
import { GraphQLCompany } from "../Types/GraphQLCompany";
import { ICompanyUser } from "../../../graphqlContext";

export const updateCurrentCompany = {
  type: GraphQLCompany,
  args: {
    cuit: {
      type: String
    },
    companyName: {
      type: String
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
  resolve: (
    _: undefined,
    args: ICompanyEditable,
    { currentUser }: { currentUser: ICompanyUser }
  ) => CompanyRepository.update({ uuid: currentUser.companyUuid, ...args })
};
