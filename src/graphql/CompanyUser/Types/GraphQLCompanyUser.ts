import { GraphQLObjectType } from "graphql";
import { GraphQLDateTime } from "graphql-iso-date";
import { nonNull, ID } from "$graphql/fieldTypes";
import { CompanyUser } from "$models";
import { GraphQLUser } from "$src/graphql/User/Types/GraphQLUser";
import { UserRepository } from "$models/User";

export const GraphQLCompanyUser = new GraphQLObjectType<CompanyUser>({
  name: "CompanyUser",
  fields: () => ({
    uuid: {
      type: nonNull(ID)
    },
    userUuid: {
      type: nonNull(ID)
    },
    companyUuid: {
      type: nonNull(ID)
    },
    updatedAt: {
      type: nonNull(GraphQLDateTime)
    },
    createdAt: {
      type: nonNull(GraphQLDateTime)
    },
    user: {
      type: GraphQLUser,
      resolve: companyUser => UserRepository.findByUuid(companyUser.userUuid)
    }
  })
});
