import { GraphQLObjectType } from "graphql";
import { GraphQLDateTime } from "graphql-iso-date";
import { ID, Int, List, nonNull, String } from "../../fieldTypes";
import { GraphQLUser } from "../../User/Types/GraphQLUser";
import { GraphQLCapability } from "../../Capability/Types/Capability";
import { GraphQLApplicantCareer } from "./ApplicantCareers";
import { GraphQLSection } from "./Section";
import { GraphQLLink } from "./Link";
import { Applicant } from "../../../models";
import { ApplicantCareersSerializer } from "../../../models/ApplicantCareer";
import { GraphQLApprovalStatus } from "../../ApprovalStatus/Types/GraphQLApprovalStatus";

export const GraphQLApplicant = new GraphQLObjectType<Applicant>({
  name: "Applicant",
  fields: () => ({
    uuid: {
      type: nonNull(ID)
    },
    user: {
      type: nonNull(GraphQLUser),
      resolve: applicant => applicant.getUser()
    },
    padron: {
      type: nonNull(Int)
    },
    description: {
      type: String
    },
    createdAt: {
      type: nonNull(GraphQLDateTime)
    },
    approvalStatus: {
      type: nonNull(GraphQLApprovalStatus)
    },
    careers: {
      type: nonNull(List(GraphQLApplicantCareer)),
      resolve: async applicant => {
        const applicantCareers = await applicant.getApplicantCareers();
        return Promise.all(applicantCareers.map(applicantCareer =>
          ApplicantCareersSerializer.serialize(applicantCareer)
        ));
      }
    },
    capabilities: {
      type: nonNull(List(GraphQLCapability)),
      resolve: async applicant =>
        (await applicant.getCapabilities()).map(({ uuid, description }) => ({ uuid, description }))
    },
    sections: {
      type: nonNull(List(GraphQLSection)),
      resolve: async applicant =>
        (await applicant.getSections()).map(({ uuid, title, text, displayOrder }) =>
          ({ uuid, title, text, displayOrder })
        )
    },
    links: {
      type: nonNull(List(GraphQLLink)),
      resolve: async applicant =>
        (await applicant.getLinks()).map(({ name, url }) => ({ name, url }))
    }
  })
});
