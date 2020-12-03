import { List, String } from "$graphql/fieldTypes";
import { CompanyRepository } from "$models/Company";
import { GraphQLCompany } from "../Types/GraphQLCompany";
import { IUpdateCompany } from "$models/Company/Interface";
import { IApolloServerContext } from "$graphql/Context";

export const updateCurrentCompany = {
  type: GraphQLCompany,
  args: {
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
    attributes: Omit<IUpdateCompany, "uuid">,
    { currentUser }: IApolloServerContext
  ) => CompanyRepository.update({ uuid: currentUser.getCompanyRole().companyUuid, ...attributes })
};
