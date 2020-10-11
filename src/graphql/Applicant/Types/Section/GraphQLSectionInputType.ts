import { GraphQLInputObjectType } from "graphql";
import { nonNull, String, ID, Int } from "$graphql/fieldTypes";

export const GraphQLSectionInputType = (name: string) =>
  new GraphQLInputObjectType({
    name,
    fields: () => ({
      uuid: {
        type: ID
      },
      title: {
        type: nonNull(String)
      },
      text: {
        type: nonNull(String)
      },
      displayOrder: {
        type: Int
      }
    })
  });
