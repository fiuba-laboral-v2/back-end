import { nonNull, ID } from "$graphql/fieldTypes";
import { GraphQLJobApplication } from "../Types/GraphQLJobApplication";
import { JobApplicationRepository } from "$models/JobApplication";

export const getJobApplicationByUuid = {
  type: GraphQLJobApplication,
  args: {
    uuid: {
      type: nonNull(ID)
    }
  },
  resolve: (_: undefined, { uuid }: { uuid: string }) => JobApplicationRepository.findByUuid(uuid)
};
