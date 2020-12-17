import { GraphQLObjectType } from "graphql";
import { GraphQLDateTime } from "graphql-iso-date";
import { nonNull } from "$graphql/fieldTypes";
import { Admin } from "$models";
import { GraphQLSecretary } from "./GraphQLSecretary";
import { GraphQLUser } from "$src/graphql/User/Types/GraphQLUser";
import { GraphQLString } from "graphql/type/scalars";
import { UserRepository } from "$models/User";

export const GraphQLAdmin = new GraphQLObjectType<Admin>({
  name: "Admin",
  fields: () => ({
    uuid: {
      type: GraphQLString,
      resolve: admin => admin.userUuid
    },
    secretary: {
      type: nonNull(GraphQLSecretary)
    },
    updatedAt: {
      type: nonNull(GraphQLDateTime)
    },
    createdAt: {
      type: nonNull(GraphQLDateTime)
    },
    user: {
      type: GraphQLUser,
      resolve: admin => UserRepository.findByUuid(admin.userUuid)
    }
  })
});
