import { GraphQLObjectType } from "graphql";
import { ID, Int, nonNull, String, List } from "../../fieldTypes";
import { GraphQLCapability } from "../../Capability/Types/Capability";
import { GraphQLApplicantCareer } from "./ApplicantCareers";
import { GraphQLSection } from "./Section";
import { GraphQLLink } from "./Link";
import { Applicant } from "../../../models/Applicant";
import { CareerApplicantSerializer } from "../../../models/CareerApplicant";

const GraphQLApplicant = new GraphQLObjectType({
  name: "Applicant",
  fields: () => ({
    uuid: {
      type: nonNull(ID)
    },
    name: {
      type: nonNull(String)
    },
    surname: {
      type: nonNull(String)
    },
    padron: {
      type: nonNull(Int)
    },
    description: {
      type: String
    },
    careers: {
      type: nonNull(List(GraphQLApplicantCareer)),
      resolve: async (applicant: Applicant) =>
        Promise.all((await applicant.getCareersApplicants()).map(careerApplicant =>
          CareerApplicantSerializer.serialize(careerApplicant)
        ))
    },
    capabilities: {
      type: nonNull(List(GraphQLCapability)),
      resolve: async (applicant: Applicant) =>
        (await applicant.getCapabilities()).map(({ uuid, description }) => ({ uuid, description }))
    },
    sections: {
      type: nonNull(List(GraphQLSection)),
      resolve: async (applicant: Applicant) =>
        (await applicant.getSections()).map(({ uuid, title, text, displayOrder }) =>
          ({ uuid, title, text, displayOrder })
        )
    },
    links: {
      type: nonNull(List(GraphQLLink)),
      resolve: async (applicant: Applicant) =>
        (await applicant.getLinks()).map(({ uuid, name, url }) => ({ uuid, name, url }))
    }
  })
});

export { GraphQLApplicant };
