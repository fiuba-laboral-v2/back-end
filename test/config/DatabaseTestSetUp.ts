import { Database } from "../../src/config/Database";

export const DatabaseTestSetUp = () => {
  beforeAll(() => Database.setConnection());
  afterAll(() => Database.close());
};
