import { GraphQLObjectType } from "graphql";
import { ID, nonNull, String } from "$graphql/fieldTypes";
import { User } from "$models";
import { GraphQLAdmin } from "$graphql/Admin/Types/GraphQLAdmin";
import { GraphQLApplicant } from "$graphql/Applicant/Types/GraphQLApplicant";
import { GraphQLCompany } from "$graphql/Company/Types/GraphQLCompany";

export const GraphQLUser = new GraphQLObjectType<User>({
  name: "User",
  fields: () => ({
    uuid: {
      type: nonNull(ID),
    },
    email: {
      type: nonNull(String),
    },
    dni: {
      type: String,
    },
    name: {
      type: nonNull(String),
    },
    surname: {
      type: nonNull(String),
    },
    admin: {
      type: GraphQLAdmin,
      resolve: user => user.getAdmin(),
    },
    applicant: {
      type: GraphQLApplicant,
      resolve: user => user.getApplicant(),
    },
    company: {
      type: GraphQLCompany,
      resolve: user => user.getCompany(),
    },
  }),
});
