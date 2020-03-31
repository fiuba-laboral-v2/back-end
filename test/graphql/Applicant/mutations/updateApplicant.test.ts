import { gql } from "apollo-server";
import { executeMutation } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";

import { CareerRepository } from "../../../../src/models/Career";
import { Career } from "../../../../src/models/Career";
import { Applicant, ApplicantRepository } from "../../../../src/models/Applicant";

import { applicantMocks } from "../../../models/Applicant/mocks";
import { careerMocks } from "../../../models/Career/mocks";
import { random, lorem } from "faker";

import { pick } from "lodash";
import { Section } from "../../../../src/models/Applicant/Section";

const UPDATE_APPLICANT = gql`
    mutation updateApplicant(
        $uuid: ID!, $padron: Int, $name: String, $surname: String, $description: String,
        $careers: [CareerCredits], $capabilities: [String], $sections: [Section]
    ) {
        updateApplicant(
            uuid: $uuid, padron: $padron, name: $name, surname: $surname description: $description,
            careers: $careers, capabilities: $capabilities, sections: $sections
        ) {
            name
            surname
            padron
            description
            capabilities {
                description
            }
            careers {
                code
                description
                credits
                creditsCount
            }
            sections {
              uuid
              title
              text
              displayOrder
            }
        }
    }
`;

describe("updateApplicant", () => {
  const createApplicant = async () => {
    const career = await CareerRepository.create(careerMocks.careerData());
    const applicantData = applicantMocks.applicantData([career.code]);
    return ApplicantRepository.create(applicantData);
  };

  beforeAll(async () => {
    await Database.setConnection();
    await Career.truncate({ cascade: true });
    await Section.truncate({ cascade: true });
    await Applicant.truncate({ cascade: true });
  });

  afterAll(async () => {
    await Database.close();
  });

  it("update all possible data", async () => {
    const applicant = await createApplicant();
    const newCareer = await CareerRepository.create(careerMocks.careerData());
    const dataToUpdate = {
      uuid: applicant.uuid,
      padron: applicant.padron,
      name: "newName",
      surname: "newSurname",
      description: "newDescription",
      capabilities: ["CSS", "clojure"],
      careers: [
        {
          code: newCareer.code,
          creditsCount: 8
        }
      ],
      sections: [
        {
          title: "title",
          text: "description",
          displayOrder: 1
        }
      ]
    };
    const careersBeforeUpdate = await applicant.getCareers();
    const capabilitiesBeforeUpdate = await applicant.getCapabilities();
    const {
      data: { updateApplicant }, errors
    } = await executeMutation(UPDATE_APPLICANT, dataToUpdate);

    expect(errors).toBeUndefined();
    expect(updateApplicant).toMatchObject({
      padron: dataToUpdate.padron,
      name: dataToUpdate.name,
      surname: dataToUpdate.surname,
      description: dataToUpdate.description
    });
    expect(
      updateApplicant.capabilities.map(c => c.description)
    ).toEqual(expect.arrayContaining(
      [
        ...dataToUpdate.capabilities,
        ...capabilitiesBeforeUpdate.map(c => c.description)
      ]
    ));
    expect(
      updateApplicant.careers.map(c => c.code)
    ).toEqual(expect.arrayContaining(
      [
        ...dataToUpdate.careers.map(c => c.code),
        ...careersBeforeUpdate.map(c => c.code)
      ]
    ));
    expect(
      updateApplicant.sections.map(({ title, text, displayOrder }) =>
        ({ title, text, displayOrder })
      )
    ).toEqual(expect.arrayContaining(
      [
        ...dataToUpdate.sections.map(({ title, text, displayOrder }) =>
          ({ title, text, displayOrder }))
      ]
    ));
  });

  describe("when a section exists", () => {
    let applicant: Applicant;
    let initialData;

    const addNewSection = async ({ uuid }, displayOrder) => {
      initialData = {
        uuid,
        sections: [{ title: random.words(), text: lorem.paragraphs(), displayOrder }]
      };
      return ApplicantRepository.update(initialData);
    };

    it("should be able to add a new section", async () => {
      applicant = await createApplicant();
      await applicant.save();
      await addNewSection(applicant, 1);
      const params = {
        uuid: applicant.uuid,
        sections: [{ title: random.words(), text: lorem.paragraphs(), displayOrder: 2 }]
      };
      const {
        data: { updateApplicant }, errors
      } = await executeMutation(UPDATE_APPLICANT, params);


      expect(updateApplicant.sections.length).toEqual(2);
      expect(
        updateApplicant.sections.map(({ title, text, displayOrder }) =>
          ({ title, text, displayOrder })
        )
      ).toEqual(expect.arrayContaining(
        [
          ...initialData.sections.map(({ title, text, displayOrder }) =>
            ({ title, text, displayOrder })),
          ...params.sections.map(({ title, text, displayOrder }) =>
            ({ title, text, displayOrder }))
        ]
      ));
    });

    it("should be able to update de fields of an existing section", async () => {
      applicant = await createApplicant();
      await applicant.save();
      await addNewSection(applicant, 1);
      const applicantWithMoreSections = await addNewSection(applicant, 2);
      const [firstSection, SecondSection] = await applicantWithMoreSections.getSections();
      const params = {
        uuid: applicant.uuid,
        sections: [
          { uuid: firstSection.uuid, title: "New title", text: "New text", displayOrder: 1 }
        ]
      };

      const {
        data: { updateApplicant }, errors
      } = await executeMutation(UPDATE_APPLICANT, params);

      expect(errors).toBeUndefined();
      expect(updateApplicant.sections.find(({ uuid }) => uuid === firstSection.uuid))
        .toMatchObject({
          uuid: firstSection.uuid, title: "New title", text: "New text", displayOrder: 1
        });
      expect(
        updateApplicant.sections.map(({ title, text, displayOrder }) =>
          ({ title, text, displayOrder })
        )
      ).toEqual(expect.arrayContaining(
        [
          ...params.sections.map(({ title, text, displayOrder }) =>
            ({ title, text, displayOrder })),
          pick(SecondSection, ["title", "text", "displayOrder"])
        ]
      ));
    });
  });
});
