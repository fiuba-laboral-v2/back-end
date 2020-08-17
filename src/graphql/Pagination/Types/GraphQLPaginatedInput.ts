import { GraphQLInputObjectType } from "graphql";
import { ID, nonNull } from "$graphql/fieldTypes";
import { GraphQLDateTime } from "graphql-iso-date";

export const GraphQLPaginatedInput = new GraphQLInputObjectType({
  name: "PaginatedInput",
  fields: () => ({
    dateTime: {
      type: nonNull(GraphQLDateTime)
    },
    uuid: {
      type: nonNull(ID)
    }
  })
});

export const GraphQLPaginatedJobApplicationsInput = new GraphQLInputObjectType({
  name: "PaginatedJobApplicationsInput",
  fields: () => ({
    dateTime: {
      type: nonNull(GraphQLDateTime)
    },
    offerUuid: {
      type: nonNull(ID)
    },
    applicantUuid: {
      type: nonNull(ID)
    }
  })
});

export interface IPaginatedInput {
  dateTime: Date;
  uuid: string;
}

export interface IPaginatedJobApplicationsInput {
  dateTime: Date;
  offerUuid: string;
  applicantUuid: string;
}
