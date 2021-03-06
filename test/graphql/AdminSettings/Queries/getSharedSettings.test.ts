import { gql } from "apollo-server";
import { SharedSettingsRepository } from "$models/SharedSettings";
import { client } from "$test/graphql/ApolloTestClient";

const GET_SHARED_SETTINGS = gql`
  query {
    getSharedSettings {
      companySignUpAcceptanceCriteria
      companyEditableAcceptanceCriteria
      editOfferAcceptanceCriteria
    }
  }
`;

describe("getSharedSettings", () => {
  const companySignUpAcceptanceCriteria = "sign up acceptance criteria";
  const companyEditableAcceptanceCriteria = "company editable acceptance criteria";
  const editOfferAcceptanceCriteria = "edit offer acceptance criteria";

  beforeAll(async () => {
    const sharedSettings = await SharedSettingsRepository.fetch();
    sharedSettings.companySignUpAcceptanceCriteria = companySignUpAcceptanceCriteria;
    sharedSettings.companyEditableAcceptanceCriteria = companyEditableAcceptanceCriteria;
    sharedSettings.editOfferAcceptanceCriteria = editOfferAcceptanceCriteria;
    await SharedSettingsRepository.save(sharedSettings);
  });

  it("gets admin settings for all permissions", async () => {
    const { data, errors } = await client.loggedOut().query({ query: GET_SHARED_SETTINGS });
    expect(errors).toBeUndefined();
    expect(data!.getSharedSettings).toEqual({
      companySignUpAcceptanceCriteria,
      companyEditableAcceptanceCriteria,
      editOfferAcceptanceCriteria
    });
  });
});
