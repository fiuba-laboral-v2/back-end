import { gql } from "apollo-server";
import { executeMutation } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";
import { CareerRepository, Career } from "../../../../src/models/Career";
import { Applicant, ApplicantRepository } from "../../../../src/models/Applicant";
import { applicantMocks } from "../../../models/Applicant/mocks";
import { careerMocks } from "../../../models/Career/mocks";

const DELETE_SECTION = gql`
    mutation deleteSection($uuid: ID!, $sectionUuid: ID!) {
      deleteSection(uuid: $uuid, sectionUuid: $sectionUuid) {
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
      }
    }
`;

describe("deleteSection", () => {
  beforeAll(async () => {
    await Database.setConnection();
    await Career.truncate({ cascade: true });
    await Applicant.truncate({ cascade: true });
  });

  afterAll(async () => {
    await Database.close();
  });

  it("should delete an existing section", async () => {
    const career = await CareerRepository.create(careerMocks.careerData());
    const applicantData = applicantMocks.applicantData([career]);
    const applicant = await ApplicantRepository.create(applicantData);

    await ApplicantRepository.update({
      uuid: applicant.uuid, sections: [{ title: "My title", text: "My text", displayOrder: 1 }]
    });

    const [section] = await applicant.getSections();
    expect(section).toMatchObject({
      title: "My title",
      text: "My text",
      displayOrder: 1
    });

    const { data: { deleteSection }, errors } = await executeMutation(DELETE_SECTION, {
      uuid: applicant.uuid,
      sectionUuid: section.uuid
    });
    expect(errors).toBeUndefined();
    expect(deleteSection.sections.length).toEqual(0);
  });
});
