import { gql } from "apollo-server";
import Database from "../../../../src/config/Database";
import { CompanyRepository } from "../../../../src/models/Company";
import { UserRepository } from "../../../../src/models/User";
import { testClientFactory } from "../../../mocks/testClientFactory";
import { OfferRepository } from "../../../../src/models/Offer";
import { OfferMocks } from "../../../models/Offer/mocks";

const EDIT_OFFER = gql`
    mutation editOffer(
        $uuid: ID!,
        $title: String!,
        $description: String!,
        $hoursPerDay: Int!,
        $minimumSalary: Int!,
        $maximumSalary: Int!
    ) {
        editOffer(
            uuid: $uuid,
            title: $title,
            description: $description,
            hoursPerDay: $hoursPerDay,
            minimumSalary: $minimumSalary,
            maximumSalary: $maximumSalary
        ) {
            uuid
            title
            description
            hoursPerDay
            minimumSalary
            maximumSalary
        }
    }
`;

describe("editOffer", () => {
  beforeAll(() => {
    Database.setConnection();
    return Promise.all([
      CompanyRepository.truncate(),
      UserRepository.truncate()
    ]);
  });
  afterAll(() => Database.close());

  it("edits an offer successfully", async () => {
    const { apolloClient, company } = await testClientFactory.company();
    const initialAttributes = OfferMocks.withObligatoryData(company.uuid);
    const { uuid } = await OfferRepository.create(initialAttributes);
    const newTitle = "Amazing Offer";
    await apolloClient.mutate({
      mutation: EDIT_OFFER,
      variables: { ...initialAttributes, uuid, title: newTitle }
    });
    const updatedOffer = await OfferRepository.findByUuid(uuid);
    expect(updatedOffer.title).not.toEqual(initialAttributes.title);
    expect(updatedOffer.title).toEqual(newTitle);
  });

  it("throws an error when the offer uuid is not found", async () => {
    const { apolloClient, company } = await testClientFactory.company();
    const attributes = OfferMocks.withObligatoryData(company.uuid);
    const response = await apolloClient.mutate({
      mutation: EDIT_OFFER,
      variables: { ...attributes, uuid: "ca2c5210-cb79-4026-9a26-1eb7a4159e71" }
    });
    expect(response.errors?.[0].extensions?.data.errorType).toEqual("OfferNotFound");
  });

  it("throws an error when the user does not belong to a company", async () => {
    const { apolloClient } = await testClientFactory.applicant();
    const attributes = OfferMocks.withObligatoryData("ca2c5210-cb79-4026-9a26-1eb7a4159e72");
    const response = await apolloClient.mutate({
      mutation: EDIT_OFFER,
      variables: { ...attributes, uuid: "ca2c5210-cb79-4026-9a26-1eb7a4159e71" }
    });
    expect(response.errors?.[0].extensions?.data.errorType).toEqual("UnauthorizedError");
  });
});
