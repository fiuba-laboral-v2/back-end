import { GraphQLObjectType } from "graphql";
import { ID, nonNull, String } from "$graphql/fieldTypes";
import { User } from "$models/User";
import { FiubaCredentials } from "$models/User/Credentials";
import { GraphQLAdmin } from "$graphql/Admin/Types/GraphQLAdmin";
import { GraphQLApplicant } from "$graphql/Applicant/Types/GraphQLApplicant";
import { GraphQLCompany } from "$graphql/Company/Types/GraphQLCompany";
import { AdminRepository } from "$models/Admin";
import { ApplicantRepository } from "$models/Applicant";
import { CompanyUserRepository } from "$models/CompanyUser";
import { CompanyRepository } from "$models/Company";

export const GraphQLUser = new GraphQLObjectType<User>({
  name: "User",
  fields: () => ({
    uuid: {
      type: nonNull(ID)
    },
    email: {
      type: nonNull(String)
    },
    dni: {
      type: String,
      resolve: user => {
        if (user.credentials instanceof FiubaCredentials) return user.credentials.dni;
        return;
      }
    },
    name: {
      type: nonNull(String)
    },
    surname: {
      type: nonNull(String)
    },
    admin: {
      type: GraphQLAdmin,
      resolve: user => AdminRepository.findByUserUuidIfExists(user.uuid!)
    },
    applicant: {
      type: GraphQLApplicant,
      resolve: user => ApplicantRepository.findByUserUuidIfExists(user.uuid!)
    },
    company: {
      type: GraphQLCompany,
      resolve: async user => {
        const companyUser = await CompanyUserRepository.findByUserUuid(user.uuid!);
        return companyUser && CompanyRepository.findByUuid(companyUser.companyUuid);
      }
    }
  })
});
