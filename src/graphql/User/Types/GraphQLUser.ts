import { GraphQLObjectType } from "graphql";
import { ID, nonNull, String } from "../../fieldTypes";
import { User } from "../../../models";
import { GraphQLAdmin } from "../../Admin/Types/GraphQLAdmin";
import { GraphQLApplicant } from "../../Applicant/Types/GraphQLApplicant";
import { GraphQLCompany } from "../../Company/Types/GraphQLCompany";

export const GraphQLUser = new GraphQLObjectType<User>({
  name: "User",
  fields: () => ({
    uuid: {
      type: nonNull(ID)
    },
    email: {
      type: nonNull(String)
    },
    name: {
      type: nonNull(String)
    },
    surname: {
      type: nonNull(String)
    },
    admin: {
      type: GraphQLAdmin,
      resolve: user => user.getAdmin()
    },
    applicant: {
      type: GraphQLApplicant,
      resolve: user => user.getApplicant()
    },
    company: {
      type: GraphQLCompany,
      resolve: user => user.getCompany()
    }
  })
});
