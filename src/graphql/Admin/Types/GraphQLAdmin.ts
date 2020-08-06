import { GraphQLObjectType } from "graphql";
import { ID, nonNull } from "$graphql/fieldTypes";
import { Admin } from "$models";

export const GraphQLAdmin = new GraphQLObjectType<Admin>({
  name: "Admin",
  fields: () => ({
    userUuid: {
      type: nonNull(ID)
    }
  })
});
