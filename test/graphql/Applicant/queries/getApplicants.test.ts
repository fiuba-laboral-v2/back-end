import { gql } from "apollo-server";
import { executeQuery } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";

import { CareerRepository } from "../../../../src/models/Career";
import { ApplicantRepository, ApplicantSerializer } from "../../../../src/models/Applicant";
import { Career } from "../../../../src/models/Career";
import { Applicant } from "../../../../src/models/Applicant";

import { applicantMocks } from "../../../models/Applicant/mocks";
import { careerMocks } from "../../../models/Career/mocks";

const GET_APPLICANTS = gql`
    query getApplicants {
        getApplicants {
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
            sections {
              title
              text
            }
            links {
              name
              url
            }
        }
    }
`;

describe("getApplicants", () => {

  beforeAll(async () => {
    await Database.setConnection();
  });

  beforeEach(async () => {
    await Career.truncate({ cascade: true });
    await Applicant.truncate({ cascade: true });
  });

  afterAll(async () => {
    await Database.close();
  });

  describe("when applicants exists", () => {
    it("should fetch the existing applicant", async () => {
      const career = await CareerRepository.create(careerMocks.careerData());
      const applicantData = applicantMocks.applicantData([career.code]);
      const applicant = await ApplicantRepository.create(applicantData);
      const { data, errors } = await executeQuery(GET_APPLICANTS);

      expect(errors).toBeUndefined();
      expect(data.getApplicants).toEqual(expect.arrayContaining(
        [await ApplicantSerializer.serialize(applicant)]
      ));
    });

    it("should fetch all the applicant", async () => {
      const career = await CareerRepository.create(careerMocks.careerData());
      const applicantsData = applicantMocks.applicantsData(
        {
          careersCodes: [career.code],
          capabilitiesDescriptions: [],
          numberOfApplicantsData: 2
        }
      );
      const applicants = [];
      for (const applicantData of applicantsData) {
        applicants.push(await ApplicantRepository.create(applicantData));
      }

      const { data, errors } = await executeQuery(GET_APPLICANTS);
      expect(errors).toBeUndefined();
      expect(data.getApplicants).toEqual(expect.arrayContaining(
        await Promise.all(applicants.map(applicant => ApplicantSerializer.serialize(applicant)))
      ));
    });
  });

  describe("when no applicant exists", () => {
    it("should fetch an empty array of applicants", async () => {
      const { data, errors } = await executeQuery(GET_APPLICANTS);
      expect(errors).toBeUndefined();
      expect(data.getApplicants).toEqual([]);
    });
  });
});
