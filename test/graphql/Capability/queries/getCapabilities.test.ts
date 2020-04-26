import { gql } from "apollo-server";
import Database from "../../../../src/config/Database";
import { CapabilityRepository } from "../../../../src/models/Capability";
import { executeQuery } from "../../ApolloTestClient";

const GET_CAPABILITIES = gql`
    query {
        getCapabilities {
            uuid
            description
        }
    }
`;

describe("getCapabilities", () => {
  beforeAll(() => Database.setConnection());

  beforeEach(() => CapabilityRepository.truncate());

  afterAll(() => Database.close());

  it("brings all capabilities in the database", async () => {
    const [java, python, ruby] = await Promise.all(
      ["java", "python", "ruby"].map(description =>
        CapabilityRepository.create({ description: description })
      )
    );
    const { data: { getCapabilities } } = await executeQuery(GET_CAPABILITIES);
    expect(getCapabilities).toEqual(
      expect.arrayContaining(
        [
          { description: "java", uuid: java.uuid },
          { description: "python", uuid: python.uuid },
          { description: "ruby", uuid: ruby.uuid }
        ]
      )
    );
  });
});
