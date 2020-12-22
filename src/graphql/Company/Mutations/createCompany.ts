import { GraphQLCompanyUserCreateInput } from "$graphql/User/Types/GraphQLCompanyUserCreateInput";
import { List, nonNull, String } from "$graphql/fieldTypes";
import { GraphQLCompany } from "../Types/GraphQLCompany";

import { Database } from "$config";
import { CompanyRepository } from "$models/Company";
import { CompanyUserRawCredentials, ICreateCompanyUser, User, UserRepository } from "$models/User";
import { Company, CompanyUser } from "$models";
import { CompanyUserRepository } from "$models/CompanyUser";
import { CompanyPhotoRepository } from "$models/CompanyPhoto";
import { CompanyPhoneNumberRepository } from "$models/CompanyPhoneNumber";

export const createCompany = {
  type: GraphQLCompany,
  args: {
    cuit: {
      type: nonNull(String)
    },
    companyName: {
      type: nonNull(String)
    },
    businessName: {
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
    },
    user: {
      type: nonNull(GraphQLCompanyUserCreateInput)
    }
  },
  resolve: async (
    _: undefined,
    { phoneNumbers, photos, user: userAttributes, ...companyAttributes }: ICreateCompany
  ) => {
    const { password, email, surname, name, position } = userAttributes;
    const credentials = new CompanyUserRawCredentials({ password });
    const user = new User({ name, surname, email, credentials });
    const company = new Company(companyAttributes);
    return Database.transaction(async transaction => {
      await UserRepository.save(user, transaction);
      await CompanyRepository.save(company, transaction);
      const companyUser = new CompanyUser({
        companyUuid: company.uuid,
        userUuid: user.uuid,
        position
      });
      await CompanyUserRepository.save(companyUser, transaction);
      await CompanyPhotoRepository.bulkCreate(photos, company, transaction);
      await CompanyPhoneNumberRepository.bulkCreate(phoneNumbers, company, transaction);
      return company;
    });
  }
};

export interface ICreateCompany {
  cuit: string;
  companyName: string;
  businessName: string;
  slogan?: string;
  description?: string;
  logo?: string;
  website?: string;
  email?: string;
  phoneNumbers?: string[];
  photos?: string[];
  user: ICreateCompanyUser;
}
