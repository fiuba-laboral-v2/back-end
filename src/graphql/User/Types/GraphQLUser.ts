import { GraphQLObjectType } from "graphql";
import { ID, nonNull, String } from "../../fieldTypes";
import { User } from "../../../models/User";
import { GraphQLApplicant } from "../../Applicant/Types/Applicant";
import { GraphQLCompany } from "../../Company/Types/GraphQLCompany";

const GraphQLUser = new GraphQLObjectType<User>({
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

export { GraphQLUser };
