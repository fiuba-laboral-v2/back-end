import { GraphQLInputObjectType } from "graphql";
import { ID, nonNull } from "$graphql/fieldTypes";
import { GraphQLDateTime } from "graphql-iso-date";

export const GraphQLPaginatedInput = new GraphQLInputObjectType({
  name: "PaginatedInput",
  fields: () => ({
    dateTime: {
      type: nonNull(GraphQLDateTime),
    },
    uuid: {
      type: nonNull(ID),
    },
  }),
});

export interface IPaginatedInput {
  dateTime: Date;
  uuid: string;
}
