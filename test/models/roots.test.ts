import Database from "../../src/config/database";
import Roots from "../../src/roots/roots";

describe("Roots Model", () => {
  afterEach(async () => {
    await Roots.destroy({truncate: true});
    return;
  });

  afterAll(async () => {
    return Database.close();
  });

  beforeAll(async () => {
    return Database.setConnection();
  });

  describe("create", () => {
    test("It should create a valid new root", async () => {
      const root: Roots = new Roots({title: "some title"});
      expect(root).not.toBeNull();
      expect(root).not.toBeUndefined();
      expect(root.title).toEqual("some title");
      return;
    });
    test("It should raise an error if title is null", async () => {
      const root: Roots = new Roots({title: null});
      await expect(root.save()).rejects.toThrow();
      return;
    });
  });
});
