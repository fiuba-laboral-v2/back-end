import Database from "../../src/config/database";
import { Root } from "../../src/models/roots";

describe("Roots Model", () => {
  beforeEach(async () => {
    await Root.destroy({truncate: true});
    return;
  });

  afterAll(() => {
    return Database.close();
  });

  beforeAll( () => {
    return Database.setConnection();
  });

  describe("create", () => {
    test("It should create a valid new root", async () => {
      const root: Root = new Root({title: "some title"});
      expect(root).not.toBeNull();
      expect(root).not.toBeUndefined();
      expect(root.title).toEqual("some title");
      return;
    });
    test("It should raise an error if title is null", async () => {
      const root: Root = new Root({title: null});
      await expect(root.save()).rejects.toThrow();
      return;
    });
  });
});
