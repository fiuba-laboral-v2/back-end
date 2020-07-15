import { Database } from "../../src/config/Database";

export const SetupDatabase = () => {
  beforeAll(() => Database.setConnection());
  afterAll(() => Database.close());
};
