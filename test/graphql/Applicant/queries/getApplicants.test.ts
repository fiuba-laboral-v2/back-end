import { gql } from "apollo-server";
import { executeQuery } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";

import { Career, CareerRepository } from "../../../../src/models/Career";
import { ApplicantRepository, ApplicantSerializer } from "../../../../src/models/Applicant";

import { applicantMocks } from "../../../models/Applicant/mocks";
import { careerMocks } from "../../../models/Career/mocks";
import { UserRepository } from "../../../../src/models/User/Repository";

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
    await UserRepository.truncate();
  });

  afterAll(async () => {
    await Database.close();
  });

  describe("when applicants exists", () => {
    it("should fetch the existing applicant", async () => {
      const career = await CareerRepository.create(careerMocks.careerData());
      const applicantData = applicantMocks.applicantData([career]);
      const applicant = await ApplicantRepository.create(applicantData);
      const { data, errors } = await executeQuery(GET_APPLICANTS);

      expect(errors).toBeUndefined();
      expect(data.getApplicants).toEqual(expect.arrayContaining(
        [await ApplicantSerializer.serialize(applicant)]
      ));
    });

    it("should fetch all the applicant", async () => {
      const career = await CareerRepository.create(careerMocks.careerData());
      const applicantData = applicantMocks.applicantData([career]);
      const applicantsData = [
        applicantData,
        {
          ...applicantData,
          user: {
            email: "another_user@hotmail.com",
            password: "dsfsGRDFGFD45354"
          }
        }
      ];
      await Promise.all(applicantsData.map(attributes => ApplicantRepository.create(attributes)));
      const { data, errors } = await executeQuery(GET_APPLICANTS);
      expect(errors).toBeUndefined();
      expect(data.getApplicants).toEqual(applicantsData.map(
        (
          {
            careers,
            description,
            name,
            padron,
            sections,
            surname
          }
        ) => expect.objectContaining({
          careers: careers.map(careerAttributes => expect.objectContaining(careerAttributes)),
          description: description,
          links: [],
          name,
          padron,
          sections,
          surname
        })
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
