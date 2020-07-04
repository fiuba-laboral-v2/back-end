import { gql } from "apollo-server";
import { Database } from "../../../../src/config/Database";

import { CareerRepository } from "../../../../src/models/Career";
import { CompanyRepository } from "../../../../src/models/Company";
import { OfferRepository } from "../../../../src/models/Offer";
import { UserRepository } from "../../../../src/models/User";

import { CareerGenerator, TCareerGenerator } from "../../../generators/Career";
import { CompanyGenerator, TCompanyGenerator } from "../../../generators/Company";
import { OfferGenerator, TOfferDataGenerator } from "../../../generators/Offer";
import { testClientFactory } from "../../../mocks/testClientFactory";
import { UnauthorizedError } from "../../../../src/graphql/Errors";
import { ApprovalStatus } from "../../../../src/models/ApprovalStatus";
import { AdminGenerator, TAdminGenerator } from "../../../generators/Admin";

const GET_OFFERS = gql`
  query {
    getOffers {
      uuid
    }
  }
`;

describe("getOffers", () => {
  let careers: TCareerGenerator;
  let companies: TCompanyGenerator;
  let offersData: TOfferDataGenerator;
  let admins: TAdminGenerator;

  beforeAll(async () => {
    Database.setConnection();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
    await UserRepository.truncate();
    careers = CareerGenerator.instance();
    companies = CompanyGenerator.instance.withMinimumData();
    offersData = OfferGenerator.data.withObligatoryData();
    admins = AdminGenerator.instance();
  });

  afterAll(() => Database.close());

  describe("when offers exists", () => {
    let offer1;
    let offer2;
    const createOffers = async () => {
      const { uuid: companyUuid } = await companies.next().value;
      const career1 = await careers.next().value;
      const career2 = await careers.next().value;
      offer1 = await OfferRepository.create({
        ...offersData.next({ companyUuid }).value,
        careers: [{ careerCode: career1.code }]
      });
      offer2 = await OfferRepository.create({
        ...offersData.next({ companyUuid }).value,
        careers: [{ careerCode: career2.code }]
      });
    };

    beforeAll(() => createOffers());

    it("returns two offers if two offers were created", async () => {
      const { apolloClient } = await testClientFactory.applicant({
        status: {
          approvalStatus: ApprovalStatus.approved,
          admin: await admins.next().value
        }
      });
      const { data, errors } = await apolloClient.query({ query: GET_OFFERS });
      expect(errors).toBeUndefined();
      expect(data!.getOffers).toHaveLength(2);
    });

    it("returns two offers with there own uuid", async () => {
      const { apolloClient } = await testClientFactory.applicant({
        status: {
          approvalStatus: ApprovalStatus.approved,
          admin: await admins.next().value
        }
      });
      const { data, errors } = await apolloClient.query({ query: GET_OFFERS });
      expect(errors).toBeUndefined();
      expect(data!.getOffers).toMatchObject(
        [
          { uuid: offer1.uuid },
          { uuid: offer2.uuid }
        ]
      );
    });
  });

  describe("when no offers exists", () => {
    beforeEach(() => Promise.all([
      CompanyRepository.truncate(),
      CareerRepository.truncate(),
      UserRepository.truncate()
    ]));

    it("returns no offers when no offers were created", async () => {
      const { apolloClient } = await testClientFactory.applicant({
        status: {
          approvalStatus: ApprovalStatus.approved,
          admin: await admins.next().value
        }
      });
      const { data, errors } = await apolloClient.query({ query: GET_OFFERS });

      expect(errors).toBeUndefined();
      expect(data!.getOffers).toHaveLength(0);
    });
  });

  it("returns an error when the user is from a company", async () => {
    const { apolloClient } = await testClientFactory.company();
    const { errors } = await apolloClient.query({ query: GET_OFFERS });
    expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
  });

  it("returns an error when the user is an admin", async () => {
    const { apolloClient } = await testClientFactory.admin();
    const { errors } = await apolloClient.query({ query: GET_OFFERS });
    expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
  });

  it("returns an error when the user is a rejected applicant", async () => {
    const { apolloClient } = await testClientFactory.applicant({
      status: {
        approvalStatus: ApprovalStatus.rejected,
        admin: await admins.next().value
      }
    });
    const { errors } = await apolloClient.query({ query: GET_OFFERS });
    expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
  });

  it("returns an error when the user is a pending applicant", async () => {
    const { apolloClient } = await testClientFactory.applicant();
    const { errors } = await apolloClient.query({ query: GET_OFFERS });
    expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
  });
});
