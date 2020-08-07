import { Database } from "$config/Database";

export const setupDatabase = () => {
  beforeAll(() => Database.setConnection());
  afterAll(() => Database.close());
};
