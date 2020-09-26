import { GraphQLObjectType } from "graphql";
import { GraphQLDateTime } from "graphql-iso-date";
import { nonNull } from "$graphql/fieldTypes";
import { Admin } from "$models";
import { GraphQLSecretary } from "./GraphQLSecretary";
import { GraphQLUser } from "$src/graphql/User/Types/GraphQLUser";

export const GraphQLAdmin = new GraphQLObjectType<Admin>({
  name: "Admin",
  fields: () => ({
    secretary: {
      type: nonNull(GraphQLSecretary)
    },
    updatedAt: {
      type: nonNull(GraphQLDateTime)
    },
    user: {
      type: GraphQLUser,
      resolve: admin => admin.getUser()
    }
  })
});
