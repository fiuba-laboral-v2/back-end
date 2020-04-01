import { gql } from "apollo-server";
import { executeMutation } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";
import { CareerRepository } from "../../../../src/models/Career";
import { Career } from "../../../../src/models/Career";
import { Applicant, ApplicantRepository } from "../../../../src/models/Applicant";
import { applicantMocks } from "../../../models/Applicant/mocks";
import { careerMocks } from "../../../models/Career/mocks";
import { capabilityMocks } from "../../../models/Capability/mocks";

const deleteApplicantCapabilities = gql`
    mutation deleteApplicantCapabilities($uuid: ID!, $capabilities: [String]) {
        deleteApplicantCapabilities(uuid: $uuid, capabilities: $capabilities) {
            uuid
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
        }
    }
`;


describe("deleteApplicantCapabilities", () => {

  beforeAll(async () => {
    await Database.setConnection();
    await Career.truncate({ cascade: true });
    await Applicant.truncate({ cascade: true });
  });

  afterAll(async () => {
    await Database.close();
  });

  it("should delete all applicant capabilities", async () => {
    const career = await CareerRepository.create(careerMocks.careerData());
    const capabilities = capabilityMocks.capabilitiesData({ size: 3 });
    const descriptions = capabilities.map(c => c.description);
    const applicantData = applicantMocks.applicantData(
      [career.code],
      descriptions
    );
    const applicant = await ApplicantRepository.create(applicantData);
    const { data, errors } = await executeMutation(deleteApplicantCapabilities, {
      uuid: applicant.uuid,
      capabilities: descriptions
    });
    expect(errors).toBeUndefined();
    expect(data.deleteApplicantCapabilities.capabilities).toHaveLength(0);
  });

  it("should not delete applicant capabilities if it does not exists", async () => {
    const career = await CareerRepository.create(careerMocks.careerData());
    const applicantData = applicantMocks.applicantData([career.code]);
    const applicant = await ApplicantRepository.create(applicantData);
    const { data, errors } = await executeMutation(deleteApplicantCapabilities, {
      uuid: applicant.uuid,
      capabilities: ["does not exists"]
    });
    expect(errors).toBeUndefined();
    expect(
      data.deleteApplicantCapabilities.capabilities
    ).toHaveLength(
      (await applicant.getCapabilities()).length
    );
  });
});
