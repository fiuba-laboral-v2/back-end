import { Database } from "../../src/config/Database";

export const setupDatabase = () => {
  beforeAll(() => Database.setConnection());
  afterAll(() => Database.close());
};
