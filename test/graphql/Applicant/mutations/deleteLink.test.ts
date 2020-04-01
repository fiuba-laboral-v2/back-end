import { gql } from "apollo-server";
import { executeMutation } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";
import { CareerRepository, Career } from "../../../../src/models/Career";
import { Applicant, ApplicantRepository } from "../../../../src/models/Applicant";
import { applicantMocks } from "../../../models/Applicant/mocks";
import { careerMocks } from "../../../models/Career/mocks";

const DELETE_LINK = gql`
    mutation deleteLink($uuid: ID!, $linkUuid: ID!) {
      deleteLink(uuid: $uuid, linkUuid: $linkUuid) {
        name
            surname
            padron
            description
            capabilities {
                uuid
                description
            }
            careers {
                code
                description
                credits
                creditsCount
            }
            sections {
              title
              text
              displayOrder
            }
            links {
              name
              url
            }
      }
    }
`;

describe("deleteLink", () => {
  beforeAll(async () => {
    await Database.setConnection();
    await Career.truncate({ cascade: true });
    await Applicant.truncate({ cascade: true });
  });

  afterAll(async () => {
    await Database.close();
  });

  it("should delete an existing link", async () => {
    const career = await CareerRepository.create(careerMocks.careerData());
    const applicantData = applicantMocks.applicantData([career.code]);
    const applicant = await ApplicantRepository.create(applicantData);

    await ApplicantRepository.update({
      uuid: applicant.uuid, links: [{ name: "other", url: "https://other.url" }]
    });

    const [link] = await applicant.getLinks();
    expect(link).toMatchObject({
      name: "other",
      url: "https://other.url"
    });

    const { data: { deleteLink }, errors } = await executeMutation(DELETE_LINK, {
      uuid: applicant.uuid,
      linkUuid: link.uuid
    });
    expect(errors).toBeUndefined();
    expect(deleteLink.sections.length).toEqual(0);
  });
});
