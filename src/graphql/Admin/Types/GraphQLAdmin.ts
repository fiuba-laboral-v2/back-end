import { GraphQLObjectType } from "graphql";
import { ID, nonNull } from "$graphql/fieldTypes";
import { Admin } from "$models";
import { GraphQLSecretary } from "./GraphQLSecretary";

export const GraphQLAdmin = new GraphQLObjectType<Admin>({
  name: "Admin",
  fields: () => ({
    userUuid: {
      type: nonNull(ID)
    },
    secretary: {
      type: nonNull(GraphQLSecretary)
    }
  })
});
