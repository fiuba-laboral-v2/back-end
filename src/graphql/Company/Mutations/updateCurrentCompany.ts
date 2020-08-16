import { List, String } from "$graphql/fieldTypes";
import { CompanyRepository } from "$models/Company";
import { GraphQLCompany } from "../Types/GraphQLCompany";
import { ICompanyUser } from "$graphql/Context";
import { ICreateCompany } from "$models/Company/Interface";

export const updateCurrentCompany = {
  type: GraphQLCompany,
  args: {
    companyName: {
      type: String,
    },
    slogan: {
      type: String,
    },
    description: {
      type: String,
    },
    logo: {
      type: String,
    },
    website: {
      type: String,
    },
    email: {
      type: String,
    },
    phoneNumbers: {
      type: List(String),
    },
    photos: {
      type: List(String),
    },
  },
  resolve: (
    _: undefined,
    attributes: ICreateCompany,
    { currentUser }: { currentUser: ICompanyUser }
  ) => CompanyRepository.update({ uuid: currentUser.company.uuid, ...attributes }),
};
