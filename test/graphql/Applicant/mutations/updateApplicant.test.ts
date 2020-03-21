import { gql } from "apollo-server";
import { executeMutation } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";

import { CareerRepository } from "../../../../src/models/Career";
import { Career } from "../../../../src/models/Career";
import { Applicant, ApplicantRepository } from "../../../../src/models/Applicant";

import { applicantMocks } from "../../../models/Applicant/mocks";
import { careerMocks } from "../../../models/Career/mocks";

const updateApplicant = gql`
    mutation updateApplicant(
        $padron: Int!, $name: String, $surname: String, $description: String,
        $careers: [CareerCredits], $capabilities: [String]
    ) {
        updateApplicant(
            padron: $padron, name: $name, surname: $surname description: $description,
            careers: $careers, capabilities: $capabilities
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
        }
    }
`;

describe("updateApplicant", () => {
  const createApplicant = async ()  => {
    const career = await CareerRepository.create(careerMocks.careerData());
    const applicantData = applicantMocks.applicantData([career.code]);
    return ApplicantRepository.create(applicantData);
  };

  beforeAll(async () => {
    await Database.setConnection();
    await Career.truncate({ cascade: true });
    await Applicant.truncate({ cascade: true });
  });

  afterAll(async () => {
    await Database.close();
  });

  it("update all possible data", async () => {
    const applicant = await createApplicant();
    const newCareer = await CareerRepository.create(careerMocks.careerData());
    const dataToUpdate = {
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
      ]
    };
    const careersBeforeUpdate = await applicant.getCareers();
    const capabilitiesBeforeUpdate = await applicant.getCapabilities();
    const { data, errors } = await executeMutation(updateApplicant, dataToUpdate);

    expect(errors).toBeUndefined();
    expect(data.updateApplicant).toMatchObject({
      padron: dataToUpdate.padron,
      name: dataToUpdate.name,
      surname: dataToUpdate.surname,
      description: dataToUpdate.description
    });
    expect(
      data.updateApplicant.capabilities.map(c => c.description)
    ).toEqual(expect.arrayContaining(
      [
        ...dataToUpdate.capabilities,
        ...capabilitiesBeforeUpdate.map(c => c.description)
      ]
    ));
    expect(
      data.updateApplicant.careers.map(c => c.code)
    ).toEqual(expect.arrayContaining(
      [
        ...dataToUpdate.careers.map(c => c.code),
        ...careersBeforeUpdate.map(c => c.code)
      ]
    ));
  });
});
