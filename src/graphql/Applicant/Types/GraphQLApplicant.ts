import { GraphQLObjectType } from "graphql";
import { GraphQLDateTime } from "graphql-iso-date";
import { ID, Int, List, nonNull, String } from "$graphql/fieldTypes";
import { GraphQLUser } from "$graphql/User/Types/GraphQLUser";
import { GraphQLCapability } from "$graphql/Capability/Types/Capability";
import { GraphQLApplicantCareer } from "./GraphQLApplicantCareer";
import { GraphQLApplicantKnowledgeSectionType } from "./ApplicantKnowledgeSection";
import { GraphQLApplicantExperienceSectionType } from "./ApplicantExperienceSection";
import { GraphQLLink } from "./Link";
import { Applicant } from "$models";
import { GraphQLApprovalStatus } from "$graphql/ApprovalStatus/Types/GraphQLApprovalStatus";
import { UserRepository } from "$models/User";

export const GraphQLApplicant = new GraphQLObjectType<Applicant>({
  name: "Applicant",
  fields: () => ({
    uuid: {
      type: nonNull(ID)
    },
    user: {
      type: nonNull(GraphQLUser),
      resolve: applicant => UserRepository.findByUuid(applicant.userUuid)
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
    updatedAt: {
      type: nonNull(GraphQLDateTime)
    },
    approvalStatus: {
      type: nonNull(GraphQLApprovalStatus)
    },
    careers: {
      type: nonNull(List(GraphQLApplicantCareer)),
      resolve: applicant => applicant.getApplicantCareers()
    },
    capabilities: {
      type: nonNull(List(GraphQLCapability)),
      resolve: applicant => applicant.getCapabilities()
    },
    knowledgeSections: {
      type: nonNull(List(GraphQLApplicantKnowledgeSectionType)),
      resolve: applicant => applicant.getKnowledgeSections()
    },
    experienceSections: {
      type: nonNull(List(GraphQLApplicantExperienceSectionType)),
      resolve: applicant => applicant.getExperienceSections()
    },
    links: {
      type: nonNull(List(GraphQLLink)),
      resolve: applicant => applicant.getLinks()
    }
  })
});
