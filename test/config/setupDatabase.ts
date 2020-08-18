import { Database } from "$config";

export const setupDatabase = () => {
  beforeAll(() => Database.setConnection());
  afterAll(() => Database.close());
};
